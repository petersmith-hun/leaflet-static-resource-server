import {FileInput, MIMEType} from "../../core/model/file-input";
import {UploadedFileCreateAttributes, UploadedFileUpdateAttributes} from "../../core/model/uploaded-file";
import {FileModel, FileUploadRequestModel, UpdateFileMetadataRequestModel} from "../model/files";

/**
 * Converts an UploadedFileCreateAttributes object to FileModel.
 *
 * @param uploadedFile source UploadedFileCreateAttributes object
 * @returns converted object as FileModel
 */
export function convertUploadedFile(uploadedFile: UploadedFileCreateAttributes): FileModel {

    return {
        originalFilename: uploadedFile.originalFilename,
        acceptedAs: uploadedFile.acceptedAs,
        description: uploadedFile.description,
        path: uploadedFile.path,
        reference: `/${uploadedFile.pathUUID}/${uploadedFile.storedFilename}`
    }
}

/**
 * Converts a FileUploadRequestModel to FileInput.
 *
 * @param fileUploadRequestModel source FileUploadRequestModel object
 * @returns converted object as FileInput
 */
export function convertUploadRequest(fileUploadRequestModel: FileUploadRequestModel): FileInput {

    return {
        size: fileUploadRequestModel.inputFile.size,
        contentType: new MIMEType(fileUploadRequestModel.inputFile.mimetype),
        originalFilename: fileUploadRequestModel.inputFile.originalFilename,
        relativePath: fileUploadRequestModel.subFolder,
        description: fileUploadRequestModel.description,
        fileContentStream: fileUploadRequestModel.inputFile.content
    }
}

/**
 * Converts an UpdateFileMetadataRequestModel objectto UploadedFileUpdateAttributes.
 *
 * @param updateFileMetadataRequestModel source UpdateFileMetadataRequestModel object
 * @returns converted object as UploadedFileUpdateAttributes
 */
export function convertMetadataUpdateRequest(updateFileMetadataRequestModel: UpdateFileMetadataRequestModel): UploadedFileUpdateAttributes {

    return {
        originalFilename: updateFileMetadataRequestModel.originalFilename,
        description: updateFileMetadataRequestModel.description
    }
}
