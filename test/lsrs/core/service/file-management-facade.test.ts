import sinon, { SinonStubbedInstance } from "sinon";
import VFSBrowser from "../../../../src/lsrs/core/service/browser/vfs-browser";
import FileManagementFacade from "../../../../src/lsrs/core/service/file-management-facade";
import FileManagementService from "../../../../src/lsrs/core/service/file-management-service";
import FileMetadataService from "../../../../src/lsrs/core/service/file-metadata-service";
import { InMemoryCache } from "../../../../src/lsrs/helper/cache";
import { uploadedFile1, uploadedFile2 } from "../dao/uploaded-file-dao.testdata";
import {
    acceptorInfo1,
    fileBuffer,
    fileInput,
    uploadedFileCreateAttributes,
    uploadedFileUpdateAttributes,
    vfsPathRoot
} from "./service.testdata";

describe("Unit tests for FileManagementFacade", () => {

    let fileMetadataService: SinonStubbedInstance<FileMetadataService>;
    let fileManagementService: SinonStubbedInstance<FileManagementService>;
    let cacheMock: SinonStubbedInstance<InMemoryCache>;
    let vfsBrowserMock: SinonStubbedInstance<VFSBrowser>;
    let fileManagementFacade: FileManagementFacade;

    beforeEach(() => {
        fileMetadataService = sinon.createStubInstance(FileMetadataService);
        fileManagementService = sinon.createStubInstance(FileManagementService);
        cacheMock = sinon.createStubInstance(InMemoryCache);
        vfsBrowserMock = sinon.createStubInstance(VFSBrowser);

        fileManagementFacade = new FileManagementFacade(fileMetadataService, fileManagementService, cacheMock, vfsBrowserMock);
    });

    describe("Test scenarios for #upload", () => {

        it("should upload file and store metadata", async () => {

            // given
            fileManagementService.upload.returns(uploadedFileCreateAttributes);

            // when
            const result = await fileManagementFacade.upload(fileInput);

            // then
            expect(result).toBe(uploadedFileCreateAttributes);

            sinon.assert.calledWith(fileManagementService.upload, fileInput);
            sinon.assert.calledWith(fileMetadataService.storeMetadata, uploadedFileCreateAttributes);
        });
    });

    describe("Test scenarios for #download", () => {

        it("should retrieve file metadata from database then download and wrap the file", async () => {

            // given
            cacheMock.get.returns(uploadedFile1);
            await fileMetadataService.retrieveMetadata.resolves(uploadedFile1);
            fileManagementService.download.returns(fileBuffer);

            // when
            const result = await fileManagementFacade.download(uploadedFile1.pathUUID);

            // then
            cacheMock.get.callArgWith(2, uploadedFile1.pathUUID);
            expect(result).not.toBeNull();
            expect(result).toStrictEqual({
                originalFilename: uploadedFile1.originalFilename,
                mimeType: uploadedFile1.acceptedAs,
                length: fileBuffer.length,
                fileContent: fileBuffer
            });

            sinon.assert.calledWith(cacheMock.get);
            sinon.assert.calledWith(fileMetadataService.retrieveMetadata, uploadedFile1.pathUUID);
            sinon.assert.calledWith(fileManagementService.download, uploadedFile1.path);
        });

        it("should retrieve file metadata from cache then download and wrap the file", async () => {

            // given
            cacheMock.get.returns(uploadedFile1);
            fileManagementService.download.returns(fileBuffer);

            // when
            const result = await fileManagementFacade.download(uploadedFile1.pathUUID);

            // then
            expect(result).not.toBeNull();
            expect(result).toStrictEqual({
                originalFilename: uploadedFile1.originalFilename,
                mimeType: uploadedFile1.acceptedAs,
                length: fileBuffer.length,
                fileContent: fileBuffer
            });

            sinon.assert.notCalled(fileMetadataService.retrieveMetadata);
            sinon.assert.calledWith(fileManagementService.download, uploadedFile1.path);
        });
    });

    describe("Test scenarios for #remove", () => {

        it("should retrieve file metadata then delete the file and the metadata", async () => {

            // given
            await fileMetadataService.retrieveMetadata.resolves(uploadedFile1);

            // when
            await fileManagementFacade.remove(uploadedFile1.pathUUID);

            // then
            sinon.assert.calledWith(fileMetadataService.retrieveMetadata, uploadedFile1.pathUUID);
            sinon.assert.calledWith(fileManagementService.remove, uploadedFile1.path);
            sinon.assert.calledWith(fileMetadataService.removeMetadata, uploadedFile1.pathUUID);
            sinon.assert.calledWith(cacheMock.remove, "metadata", uploadedFile1.pathUUID);
        });
    });

    describe("Test scenarios for #createDirectory", () => {

        it("should create a new directory via file management service", () => {

            // given
            const parent = "parentDir";
            const directoryName = "newDir1";

            // when
            fileManagementFacade.createDirectory(parent, directoryName);

            // then
            sinon.assert.calledWith(fileManagementService.createDirectory, parent, directoryName);
        });
    });

    describe("Test scenarios for #retrieveStoredFileList", () => {

        it("should retrieve stored file list via file metadata service", async () => {

            // given
            const fileDescriptors = [uploadedFile1, uploadedFile2];

            await fileMetadataService.getUploadedFiles.resolves(fileDescriptors);

            // when
            const result = await fileManagementFacade.retrieveStoredFileList();

            // then
            expect(result).not.toBeNull();
            expect(result).toStrictEqual(fileDescriptors);
        });
    });

    describe("Test scenarios for #updateMetadata", () => {

        it("should update file metadata via file metadata service", async () => {

            // when
            await fileManagementFacade.updateMetadata(uploadedFile1.pathUUID, uploadedFileUpdateAttributes);

            // then
            sinon.assert.calledWith(fileMetadataService.updateMetadata, uploadedFile1.pathUUID, uploadedFileUpdateAttributes);
            sinon.assert.calledWith(cacheMock.remove, "metadata", uploadedFile1.pathUUID);
        });
    });

    describe("Test scenarios for #getCheckedMetaInfo", () => {

        it("should return metadata if both the file and its metadata exist", async () => {

            // given
            await fileMetadataService.retrieveMetadata.resolves(uploadedFile1);
            fileManagementService.exists.returns(true);

            // when
            const result = await fileManagementFacade.getCheckedMetaInfo(uploadedFile1.pathUUID);

            // then
            expect(result).not.toBeNull();
            expect(result).toBe(uploadedFile1);
        });

        it("should not return metadata if metadata exists but the file is missing", async () => {

            // given
            await fileMetadataService.retrieveMetadata.resolves(uploadedFile1);
            fileManagementService.exists.returns(false);

            // when
            const result = await fileManagementFacade.getCheckedMetaInfo(uploadedFile1.pathUUID);

            // then
            expect(result).toBeNull();
        });

        it("should not return metadata if metadata does not exist", async () => {

            // given
            await fileMetadataService.retrieveMetadata.rejects();

            // when
            const result = await fileManagementFacade.getCheckedMetaInfo(uploadedFile1.pathUUID);

            // then
            expect(result).toBeNull();
            sinon.assert.notCalled(fileManagementService.exists);
        });
    });

    describe("Test scenarios for #getAcceptorInfo", () => {

        it("should return list of configured acceptors", () => {

            // given
            fileManagementService.getAcceptorInfo.returns([acceptorInfo1]);

            // when
            const result = fileManagementFacade.getAcceptorInfo();

            // then
            expect(result).not.toBeNull();
            expect(result).toStrictEqual([acceptorInfo1]);
        });
    });

    describe("Test scenarios for #browseVFS", () => {

        it("should pass processing of request to VFSBrowser component", async () => {

            // when
            await fileManagementFacade.browseVFS(vfsPathRoot);

            // then
            sinon.assert.calledWith(vfsBrowserMock.browseVFS, vfsPathRoot);
        });
    });
});
