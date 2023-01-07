import {NextFunction, Request, Response} from "express";
import formidable, {File} from "formidable";
import {Writable} from "stream";
import {
    ConflictingResourceError,
    InaccessibleFileError,
    InvalidFileInputError,
    ResourceNotFoundError
} from "../../core/error/error-types";
import {InvalidRequestError} from "../error/api-error-types";
import {ConstraintViolationErrorMessage, ErrorMessage, HttpStatus} from "../model/common";

/**
 * Error type to HTTP status mapping.
 */
const errorStatusMap = new Map<string, HttpStatus>([
    [InvalidFileInputError.name, HttpStatus.BAD_REQUEST],
    [InvalidRequestError.name, HttpStatus.BAD_REQUEST],
    [ResourceNotFoundError.name, HttpStatus.NOT_FOUND],
    [InaccessibleFileError.name, HttpStatus.NOT_FOUND],
    [ConflictingResourceError.name, HttpStatus.CONFLICT]
]);

/**
 * Error handler middleware for Express.
 * Generates and sends an error response model, along with setting the response status based on the received error type.
 *
 * @param error thrown error object
 * @param request Express Request object
 * @param response Express Response object
 * @param next Express next function
 */
export const errorHandlerMiddleware = (error: Error, request: Request, response: Response, next: NextFunction) => {

    const errorType = error.constructor.name;
    const errorMessage: ErrorMessage | ConstraintViolationErrorMessage = errorType == InvalidRequestError.name
        ? {message: error.message, violations: (error as InvalidRequestError).constraintViolations}
        : {message: error.message};

    response
        .status(errorStatusMap.get(errorType) ?? HttpStatus.INTERNAL_SERVER_ERROR)
        .json(errorMessage);
};


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

    await new Promise<void>((resolve, reject) => {

        const fileUploadWritable = new FileUploadWritable();
        const form = formidable({
            fileWriteStreamHandler: () => fileUploadWritable
        });

        form.parse(request, (error, fields, files) => {

            if (error) {
                reject(error);
            } else {

                const inputFile: File = files.inputFile as File;

                request.body.inputFile = {
                    size: inputFile.size,
                    originalFilename: inputFile.originalFilename,
                    mimetype: inputFile.mimetype,
                    content: fileUploadWritable.getBuffer()
                };
                request.body.subFolder = fields.subFolder as string;
                request.body.description = fields.description as string;

                resolve();
            }
        });
    });

    next();
}