import ConfigurationProvider from "../../../../src/lsrs/core/config/configuration-provider";
import DatasourceConfiguration from "../../../../src/lsrs/core/config/datasource-configuration";
import UploadedFileDAO from "../../../../src/lsrs/core/dao/uploaded-file-dao";
import {ResourceNotFoundError} from "../../../../src/lsrs/core/error/error-types";
import {UploadedFile, UploadedFileCreateAttributes} from "../../../../src/lsrs/core/model/uploaded-file";
import {newUploadedFile, uploadedFile1, uploadedFile2, uploadedFile3} from "./uploaded-file-dao.testdata";

describe("Integration tests for UploadedFileDAO", () => {

    let uploadedFileDAO: UploadedFileDAO;

    beforeAll(async () => {
        await new DatasourceConfiguration(new ConfigurationProvider()).init();
        uploadedFileDAO = new UploadedFileDAO();
        await UploadedFile.sync();
    });

    beforeEach(() => {
        UploadedFile.bulkCreate([
            uploadedFile1,
            uploadedFile2,
            uploadedFile3
        ]);
    });

    afterEach(() => {
        UploadedFile.truncate();
    });

    describe("Test scenarios for #findByID", () => {

        it("should return the specified metadata record", async () => {

            // when
            const result = await uploadedFileDAO.findByID(uploadedFile1.id);

            // then
            expect(result).not.toBeNull();
            expect(result!.dataValues).toEqual(uploadedFile1);
        });

        it("should return empty promise if missing", async () => {

            // given
            const notExistingID = 1000;

            // when
            const result = await uploadedFileDAO.findByID(notExistingID);

            // then
            expect(result).toBeNull();
        });
    });

    describe("Test scenarios for #findByPathUUID", () => {

        it("should return the specified metadata record", async () => {

            // when
            const result = await uploadedFileDAO.findByPathUUID(uploadedFile2.pathUUID);

            // then
            expect(result).not.toBeNull();
            expect(result!.dataValues).toEqual(uploadedFile2);
        });

        it("should return empty promise if missing", async () => {

            // given
            const notExistingID = "not-existing-uuid";

            // when
            const result = await uploadedFileDAO.findByPathUUID(notExistingID);

            // then
            expect(result).toBeNull();
        });
    });

    describe("Test scenarios for #findAll", () => {

        it("should return the specified metadata record", async () => {

            // when
            const result = await uploadedFileDAO.findAll();

            // then
            expect(result).not.toBeNull();
            expect(result.length).toEqual(3);
            expect(result.map(item => item.dataValues))
                .toEqual([uploadedFile1, uploadedFile2, uploadedFile3]);
        });
    });

    describe("Test scenarios for #update", () => {

        it("should update the description of the record", async () => {

            // given
            const updatedAttributes = {
                description: "new updated description"
            };

            // when
            const result = await uploadedFileDAO.update(uploadedFile3.id, updatedAttributes);

            // then
            const updatedUploadedFile = await uploadedFileDAO.findByID(uploadedFile3.id);
            expect(result).not.toBeNull();
            expect(result).not.toEqual(uploadedFile3);
            expect(updatedUploadedFile?.description).toEqual(updatedAttributes.description);
            expect(updatedUploadedFile?.updatedAt).not.toBeNull();
        });

        it("should update the original filename and the enabled flag of the record", async () => {

            // given
            const updatedAttributes = {
                originalFilename: "new_original_filename.jpg",
                enabled: true
            };

            // when
            const result = await uploadedFileDAO.update(uploadedFile2.id, updatedAttributes);

            // then
            const updatedUploadedFile = await uploadedFileDAO.findByID(uploadedFile2.id);
            expect(result).not.toBeNull();
            expect(result).not.toEqual(uploadedFile2);
            expect(updatedUploadedFile?.originalFilename).toEqual(updatedAttributes.originalFilename);
            expect(updatedUploadedFile?.enabled).toEqual(updatedAttributes.enabled);
            expect(updatedUploadedFile?.updatedAt).not.toBeNull();
            expect(updatedUploadedFile?.updatedAt).not.toEqual(uploadedFile2.updatedAt);
        });

        it("should throw error if entity does not exist", async () => {

            // given
            const notExistingID = 300;
            const updatedAttributes = {
                description: "new updated description"
            };

            // when
            const failingCall = async () => await uploadedFileDAO.update(notExistingID, updatedAttributes);

            // then
            await expect(failingCall).rejects.toThrow(ResourceNotFoundError);
        });
    });

    describe("Test scenarios for #delete", () => {

        it("should remove the existing record", async () => {

            // when
            await uploadedFileDAO.delete(uploadedFile1.id);

            // then
            const existingRecords = await uploadedFileDAO.findAll();
            expect(existingRecords.length).toEqual(2);
            expect(existingRecords.map(item => item.id).includes(uploadedFile1.id)).toEqual(false);
        });

        it("should do nothing if record does not exist", async () => {

            // given
            const notExistingID = 400;

            // when
            await uploadedFileDAO.delete(notExistingID);

            // then
            const existingRecords = await uploadedFileDAO.findAll();
            expect(existingRecords.length).toEqual(3);
            expect(existingRecords.map(item => item.dataValues))
                .toEqual([uploadedFile1, uploadedFile2, uploadedFile3]);
        });
    });

    describe("Test scenarios for #save", () => {

        it("should create a new record", async () => {

            // when
            const result = await uploadedFileDAO.save(newUploadedFile);

            // then
            const existingRecords = await uploadedFileDAO.findAll();
            expect(existingRecords.length).toEqual(4);

            const newRecord = (await uploadedFileDAO.findByID(result.id))!;
            expect(createUploadedFileCreateAttributes(newRecord)).toEqual(newUploadedFile);
            expect(createUploadedFileCreateAttributes(result)).toEqual(newUploadedFile);
        });

        function createUploadedFileCreateAttributes(uploadedFile: UploadedFile): UploadedFileCreateAttributes {
            return {
                path: uploadedFile.path,
                pathUUID: uploadedFile.pathUUID,
                originalFilename: uploadedFile.originalFilename,
                storedFilename: uploadedFile.storedFilename,
                description: uploadedFile.description,
                acceptedAs: uploadedFile.acceptedAs
            };
        }
    });
});
