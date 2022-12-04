import {Service} from "typedi";
import {Optional} from "../../helper/common-utilities";
import {ResourceNotFoundError} from "../error/error-types";
import {
    UploadedFile,
    UploadedFileAdministrativeAttributes,
    UploadedFileCreateAttributes,
    UploadedFileUpdateAttributes
} from "../model/uploaded-file";

/**
 * DAO implementation based on Sequelize model operations for handling the metadata of the uploaded files.
 */
@Service()
export default class UploadedFileDAO {

    /**
     * Returns a metadata record by its ID or null if it does not exist.
     *
     * @param id ID of the metadata record
     * @returns metadata record as UploadedFile or null if it does not exist, wrapped in Promise
     */
    async findByID(id: number): Promise<Optional<UploadedFile>> {
        return await UploadedFile.findByPk(id);
    }

    /**
     * Returns a metadata record by its path UUID value or null if it does not exist.
     *
     * @param pathUUID path UUID value of the metadata record
     * @returns metadata record as UploadedFile or null if it does not exist, wrapped in Promise
     */
    async findByPathUUID(pathUUID: string): Promise<Optional<UploadedFile>> {

        return await UploadedFile.findOne({
            where: {pathUUID: pathUUID}
        });
    }

    /**
     * Returns all existing metadata records.
     *
     * @returns all existing metadata records
     */
    async findAll(): Promise<UploadedFile[]> {
        return await UploadedFile.findAll();
    }

    /**
     * Updates an existing metadata record by its ID, then returns the updated entity.
     *
     * @param id ID of the metadata record
     * @param updatedAttributes updated values of the metadata record
     * @returns the updated metadata record as UploadedFile, wrapped in Promise
     * @throws ResourceNotFoundError if the metadata record to be updated does not exist
     */
    async update(id: number, updatedAttributes: Partial<UploadedFileUpdateAttributes | UploadedFileAdministrativeAttributes>): Promise<UploadedFile> {

        const uploadedFile = await this.findByID(id);
        if (!uploadedFile) {
            throw new ResourceNotFoundError(UploadedFile, id);
        }

        await uploadedFile.update({...updatedAttributes, updatedAt: new Date()});

        return (await this.findByID(id))!;
    }

    /**
     * Deletes an existing metadata record by its ID.
     *
     * @param id ID of the metadata record
     */
    async delete(id: number): Promise<void> {

        await this.findByID(id)
            .then(uploadedFile => uploadedFile?.destroy());
    }

    /**
     * Stores the given new metadata record, then returns it.
     *
     * @param uploadedFile mandatory pieces of information for the new metadata record
     * @returns the created record as UploadedFile, wrapped in Promise
     */
    async save(uploadedFile: UploadedFileCreateAttributes): Promise<UploadedFile> {
        return await UploadedFile.create(uploadedFile);
    }
}
