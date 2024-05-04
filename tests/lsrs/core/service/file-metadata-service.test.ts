import UploadedFileDAO from "@app/core/dao/uploaded-file-dao";
import { ConflictingResourceError, GenericError, ResourceNotFoundError } from "@app/core/error/error-types";
import { UploadedFile } from "@app/core/model/uploaded-file";
import FileMetadataService from "@app/core/service/file-metadata-service";
import { newUploadedFile, uploadedFile1, uploadedFile2, uploadedFile3 } from "@testdata/dao";
import { UniqueConstraintError } from "sequelize";
import sinon, { SinonStubbedInstance } from "sinon";

describe("Unit tests for FileMetadataService", () => {

    let uploadedFileDAO: SinonStubbedInstance<UploadedFileDAO>;
    let fileMetadataService: FileMetadataService;

    beforeEach(() => {
        uploadedFileDAO = sinon.createStubInstance(UploadedFileDAO);
        fileMetadataService = new FileMetadataService(uploadedFileDAO);
    });

    describe("Test scenarios for #retrieveMetadata", () => {

        it("should retrieve metadata record for the given path UUID with success", async () => {

            // given
            const uploadedFile: UploadedFile = {dataValues: uploadedFile1} as UploadedFile;
            uploadedFileDAO.findByPathUUID.resolves(uploadedFile);

            // when
            const result = await fileMetadataService.retrieveMetadata(uploadedFile1.pathUUID);

            // then
            sinon.assert.calledWith(uploadedFileDAO.findByPathUUID, uploadedFile1.pathUUID);
            expect(result).toEqual(uploadedFile1);
        });

        it("should throw ResourceNotFoundError for missing record", async () => {

            // given
            uploadedFileDAO.findByPathUUID.resolves(null);

            // when
            const failingCall = async () => await fileMetadataService.retrieveMetadata(uploadedFile1.pathUUID);

            // then
            await expect(failingCall).rejects.toThrow(ResourceNotFoundError);
            await expect(failingCall).rejects.toThrow("Entity of type UploadedFile identified by d4b1830d-f368-37a0-88f9-2faf7fa8ded6 is not found");
        });
    });

    describe("Test scenarios for #storeMetadata", () => {

        it("should store new metadata record successfully", async () => {

            // given
            const uploadedFile: UploadedFile = {id: 100, dataValues: newUploadedFile} as UploadedFile;
            uploadedFileDAO.save.resolves(uploadedFile);

            // when
            const result = await fileMetadataService.storeMetadata(newUploadedFile);

            // then
            expect(result).toEqual(100);
        });

        it("should throw ConflictingResourceError for new record with already existing stored path", async () => {

            // given
            uploadedFileDAO.save.throws(new UniqueConstraintError({}));

            // when
            const failingCall = async () => await fileMetadataService.storeMetadata(newUploadedFile);

            // then
            await expect(failingCall).rejects.toThrow(ConflictingResourceError);
            await expect(failingCall).rejects.toThrow("Entity of type UploadedFile identified by fa245fcc-a6fb-4b9a-bacd-932d1f13a49d already exists");
        });

        it("should throw GenericError for any other processing error while saving the record", async () => {

            // given
            uploadedFileDAO.save.throws(Error);

            // when
            const failingCall = async () => await fileMetadataService.storeMetadata(newUploadedFile);

            // then
            await expect(failingCall).rejects.toThrow(GenericError);
            await expect(failingCall).rejects.toThrow("Failed to store metadata record: Error");
        });
    });

    describe("Test scenarios for #removeMetadata", () => {

        it("should remove the existing metadata record", async () => {

            // given
            const uploadedFile: UploadedFile = {id: uploadedFile1.id, dataValues: uploadedFile1} as UploadedFile;
            uploadedFileDAO.findByPathUUID.resolves(uploadedFile);

            // when
            await fileMetadataService.removeMetadata(uploadedFile1.pathUUID);

            // then
            sinon.assert.calledWith(uploadedFileDAO.findByPathUUID, uploadedFile1.pathUUID);
            sinon.assert.calledWith(uploadedFileDAO.delete, uploadedFile1.id);
        });

        it("should throw ResourceNotFoundError for missing record", async () => {

            // given
            uploadedFileDAO.findByPathUUID.throws(new ResourceNotFoundError(UploadedFile, uploadedFile1.pathUUID));

            // when
            const failingCall = async () => await fileMetadataService.removeMetadata(uploadedFile1.pathUUID);

            // then
            await expect(failingCall).rejects.toThrow(ResourceNotFoundError);
            sinon.assert.notCalled(uploadedFileDAO.delete);
        });
    });

    describe("Test scenarios for #updateMetadata", () => {

        it("should update the existing metadata record", async () => {

            // given
            const uploadedFile: UploadedFile = {id: uploadedFile1.id, dataValues: uploadedFile1} as UploadedFile;
            const updatedMetadata = {description: "new description"};
            uploadedFileDAO.findByPathUUID.resolves(uploadedFile);

            // when
            await fileMetadataService.updateMetadata(uploadedFile1.pathUUID, updatedMetadata);

            // then
            sinon.assert.calledWith(uploadedFileDAO.findByPathUUID, uploadedFile1.pathUUID);
            sinon.assert.calledWith(uploadedFileDAO.update, uploadedFile1.id, updatedMetadata);
        });

        it("should throw ResourceNotFoundError for missing record", async () => {

            // given
            uploadedFileDAO.findByPathUUID.throws(new ResourceNotFoundError(UploadedFile, uploadedFile1.pathUUID));

            // when
            const failingCall = async () => await fileMetadataService.updateMetadata(uploadedFile1.pathUUID, {});

            // then
            await expect(failingCall).rejects.toThrow(ResourceNotFoundError);
            sinon.assert.notCalled(uploadedFileDAO.update);
        });
    });

    describe("Test scenarios for #getUploadedFiles", () => {

        it("should return all existing records", async () => {

            // given
            const uploadedFiles: UploadedFile[] = [uploadedFile1, uploadedFile2, uploadedFile3]
                .map(uploadedFile => ({dataValues: uploadedFile}) as UploadedFile);
            uploadedFileDAO.findAll.resolves(uploadedFiles);

            // when
            const result = await fileMetadataService.getUploadedFiles();

            // then
            expect(result).toEqual([uploadedFile1, uploadedFile2, uploadedFile3]);
        });

        it("should return empty list it no records exist", async () => {

            // given
            uploadedFileDAO.findAll.resolves([]);

            // when
            const result = await fileMetadataService.getUploadedFiles();

            // then
            expect(result).toEqual([]);
        });
    });
});
