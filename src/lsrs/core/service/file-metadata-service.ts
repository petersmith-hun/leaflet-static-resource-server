import {UniqueConstraintError} from "sequelize";
import {Inject, Service} from "typedi";
import UploadedFileDAO from "../dao/uploaded-file-dao";
import {ConflictingResourceError, GenericError, ResourceNotFoundError} from "../error/error-types";
import {
    UploadedFile,
    UploadedFileCreateAttributes,
    UploadedFileDescriptor,
    UploadedFileUpdateAttributes
} from "../model/uploaded-file";

/**
 * Uploaded file metadata operations interface.
 */
@Service()
export default class FileMetadataService {

    private readonly uploadedFileDAO: UploadedFileDAO;

    constructor(@Inject() uploadedFileDAO: UploadedFileDAO) {
        this.uploadedFileDAO = uploadedFileDAO;
    }

    /**
     * Retrieves metadata for given pathUUID.
     *
     * @param pathUUID pathUUID of the file to retrieve metadata of
     * @returns metadata as UploadedFileDescriptor, wrapped in Promise
     */
    async retrieveMetadata(pathUUID: string): Promise<UploadedFileDescriptor> {

        const uploadedFile = await this.uploadedFileDAO.findByPathUUID(pathUUID);
        if (!uploadedFile) {
            throw new ResourceNotFoundError(UploadedFile, pathUUID);
        }

        return uploadedFile.dataValues;
    }

    /**
     * Stores metadata of uploaded file.
     *
     * @param uploadedFile uploaded file information as UploadedFileCreateAttributes
     * @returns ID of created metadata record
     */
    async storeMetadata(uploadedFile: UploadedFileCreateAttributes): Promise<number> {

        let storedUploadedFile: UploadedFileDescriptor;
        try {
            storedUploadedFile = await this.uploadedFileDAO.save(uploadedFile)
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new ConflictingResourceError(UploadedFile, uploadedFile.pathUUID);
            } else {
                throw new GenericError(`Failed to store metadata record: ${error}`)
            }
        }

        return storedUploadedFile.id;
    }

    /**
     * Removes metadata for given file by pathUUID.
     *
     * @param pathUUID pathUUID of the file to remove metadata of
     */
    async removeMetadata(pathUUID: string): Promise<void> {

        const uploadedFile = await this.retrieveMetadata(pathUUID);
        await this.uploadedFileDAO.delete(uploadedFile.id);
    }

    /**
     * Updates file metadata.
     *
     * @param pathUUID pathUUID of existing file to update metadata of
     * @param updatedMetadata updated metadata as UploadedFileUpdateAttributes
     */
    async updateMetadata(pathUUID: string, updatedMetadata: UploadedFileUpdateAttributes): Promise<void> {

        const uploadedFile = await this.retrieveMetadata(pathUUID);
        await this.uploadedFileDAO.update(uploadedFile.id, updatedMetadata);
    }

    /**
     * Retrieves metadata for all uploaded files.
     *
     * @returns list of uploaded files as UploadedFileDescriptor array, wrapped in Promise
     */
    async getUploadedFiles(): Promise<UploadedFileDescriptor[]> {

        return (await this.uploadedFileDAO.findAll())
            .map(uploadedFile => uploadedFile.dataValues);
    }
}
