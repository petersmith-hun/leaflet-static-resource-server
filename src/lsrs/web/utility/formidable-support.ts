import { NextFunction, Request, Response } from "express";
import formidable, { Part } from "formidable";
import IncomingForm from "formidable/Formidable";
import { Writable } from "stream";
import { HttpStatus } from "../model/common";

/**
 * File upload handler middleware for Express using Formidable form parser.
 * Parses the file upload form and collects the file chunks into a FileUploadWritable object. When parsing is done,
 * the collected chunks are converted to a Buffer and finally the file contents and the metadata provided with the
 * uploaded file are passed forward on the chain in the standard Express request object (under the original form field
 * names, inputFile, subFolder and description). Any error that happening while parsing the form triggers a rejection,
 * while success resolved the wrapping Promise object.
 *
 * @param request Express Request object
 * @param response Express Response object
 * @param next Express next function
 */
export const formidableUploadMiddleware = async (request: Request, response: Response, next: NextFunction) => {

    await new Promise<void>((resolve, _) => {

        const fileUploadWritable = new FileUploadWritable();
        const form = formidable({
            fileWriteStreamHandler: () => fileUploadWritable,
        });

        form.onPart = removeMIMETypeIfNeeded(form);

        form.parse(request, (error, fields, files) => {

            if (error) {
                handleErrorResponse(response, error);
            } else {
                populateRequestBody(fields, files, request, fileUploadWritable);
            }

            resolve();
        });
    });

    next();
}

/**
 * Writable implementation for file uploads, collecting the received chunks into array, which can be converted into a buffer.
 */
class FileUploadWritable extends Writable {

    private readonly chunks: any[] = [];

    _write(chunk: any, encoding: BufferEncoding, callback: (error?: (Error | null)) => void) {
        this.chunks.push(chunk);
        callback();
    }

    /**
     * Returns the collected chunks as concatenated buffer.
     */
    getBuffer(): Buffer {
        return Buffer.concat(this.chunks);
    }
}

/**
 * The code below aims to mitigate a known issue with how Formidable is handling text/plain form-data fields.
 * https://github.com/node-formidable/formidable/issues/875
 *
 * @param form Formidable IncomingForm object
 */
/* istanbul ignore next */
function removeMIMETypeIfNeeded(form: IncomingForm) {

    function isTextInputField(part: formidable.Part) {
        // @ts-ignore
        return part.mimetype && !part.headers["content-disposition"]?.match(/filename="/);
    }

    return (part: Part) => {

        if (isTextInputField(part)) {
            // @ts-ignore
            delete part.mimetype;
        }

        form._handlePart(part);
    };
}

function handleErrorResponse(response: Response, error: any) {

    response
        .status(HttpStatus.BAD_REQUEST)
        .json({message: error.message ?? "Invalid input file"});
}

function populateRequestBody(fields: formidable.Fields, files: formidable.Files, request: Request, fileUploadWritable: FileUploadWritable) {

    const inputFile = files.inputFile?.pop();

    if (inputFile) {
        request.body.inputFile = {
            size: inputFile.size,
            originalFilename: inputFile.originalFilename,
            mimetype: inputFile.mimetype,
            content: fileUploadWritable.getBuffer()
        };
    }
    request.body.subFolder = fields.subFolder?.pop();
    request.body.description = fields.description?.pop();
}
