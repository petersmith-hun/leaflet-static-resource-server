import ConfigurationProvider, { ServerConfig, StorageConfig } from "@app/core/config/configuration-provider";
import { ResourceNotFoundError } from "@app/core/error/error-types";
import { VFSPath } from "@app/core/model/file-browser-api";
import FileManagementFacade from "@app/core/service/file-management-facade";
import { ControllerType } from "@app/web/controller/controller";
import FilesController from "@app/web/controller/files-controller";
import { InvalidRequestError } from "@app/web/error/api-error-types";
import { Headers, HttpStatus } from "@app/web/model/common";
import { uploadedFile1, uploadedFile2 } from "@testdata/dao";
import {
    acceptorInfo1,
    acceptorInfo2,
    downloadableFileWrapper,
    fileBuffer,
    fileInput,
    vfsContent
} from "@testdata/service";
import {
    browseRequestImages,
    browseRequestImagesDeepSub,
    browseRequestImagesSub1,
    browseRequestRoot,
    directoryCreationRequestModel,
    directoryCreationRequestModelInvalid,
    directoryModel1,
    directoryModel2,
    fileIdentifier,
    fileIdentifierInvalid,
    fileModel1,
    fileModel2,
    fileUploadRequestModel,
    fileUploadRequestModelInvalid,
    updateFileMetadataRequestModel,
    updateFileMetadataRequestModelInvalid,
    uploadedFileUpdateAttributes,
    vfsBrowserModel
} from "@testdata/web";
import sinon, { SinonStub, SinonStubbedInstance } from "sinon";

describe("Unit tests for FilesController", () => {

    let fileManagementFacadeMock: SinonStubbedInstance<FileManagementFacade>;
    let configurationProviderMock: SinonStubbedInstance<ConfigurationProvider>;
    let filesController: FilesController;

    beforeEach(() => {
        fileManagementFacadeMock = sinon.createStubInstance(FileManagementFacade);
        configurationProviderMock = sinon.createStubInstance(ConfigurationProvider);

        configurationProviderMock.getServerConfig.returns({contextPath: "/test"} as unknown as ServerConfig);
        configurationProviderMock.getStorageConfig.returns({maxAgeInDays: 30} as unknown as StorageConfig);

        filesController = new FilesController(fileManagementFacadeMock, configurationProviderMock);
    });

    describe("Test scenarios for #getUploadedFiles", () => {

        it("should return list of uploaded files", async () => {

            // given
            await fileManagementFacadeMock.retrieveStoredFileList.resolves([uploadedFile1, uploadedFile2]);

            // when
            const result = await filesController.getUploadedFiles();

            // then
            expect(result).not.toBeNull();
            expect(result.status).toBe(HttpStatus.OK);
            expect(result.sendAsRaw).toBe(false);
            expect(result.content!.files.length).toBe(2);
            expect(result.content!.files).toContainEqual(fileModel1);
            expect(result.content!.files).toContainEqual(fileModel2);
        });

        it("should return empty file list if no file is uploaded", async () => {

            // given
            await fileManagementFacadeMock.retrieveStoredFileList.resolves([]);

            // when
            const result = await filesController.getUploadedFiles();

            // then
            expect(result).not.toBeNull();
            expect(result.status).toBe(HttpStatus.OK);
            expect(result.content!.files.length).toBe(0);
        });
    });

    describe("Test scenarios for #download", () => {

        it("should retrieve contents of an uploaded file with its metadata passed in header", async () => {

            // given
            await fileManagementFacadeMock.download.withArgs(fileIdentifier.pathUUID).resolves(downloadableFileWrapper);

            // when
            const result = await filesController.download(fileIdentifier);

            // then
            expect(result).not.toBeNull();
            expect(result.status).toBe(HttpStatus.OK);
            expect(result.sendAsRaw).toBe(true);
            expect(result.content).toStrictEqual(fileBuffer);
            expect(result.headers.size).toBe(3);
            expect(result.headers.get(Headers.CONTENT_LENGTH)).toBe(downloadableFileWrapper.length);
            expect(result.headers.get(Headers.CONTENT_TYPE)).toBe(downloadableFileWrapper.mimeType);
            expect(result.headers.get(Headers.CACHE_CONTROL)).toBe("max-age=2592000");
        });

        it("should throw validation error for invalid identifier", async () => {

            // when
            const failingCall = async () => await filesController.download(fileIdentifierInvalid);

            // then
            // exception expected
            await expect(failingCall).rejects.toThrow(InvalidRequestError);
        });
    });

    describe("Test scenarios for #getFileDetails", () => {

        it("should return details of an existing file", async () => {

            // given
            await fileManagementFacadeMock.getCheckedMetaInfo.withArgs(fileIdentifier.pathUUID).resolves(uploadedFile1);

            // when
            const result = await filesController.getFileDetails(fileIdentifier);

            // then
            expect(result).not.toBeNull();
            expect(result.status).toBe(HttpStatus.OK);
            expect(result.sendAsRaw).toBe(false);
            expect(result.content).toStrictEqual(fileModel1);
        });

        it("should throw error on missing file", async () => {

            // given
            await fileManagementFacadeMock.getCheckedMetaInfo.withArgs(fileIdentifier.pathUUID).resolves(null);

            // when
            const failingCall = async () => await filesController.getFileDetails(fileIdentifier);

            // then
            // exception expected
            await expect(failingCall).rejects.toThrow(ResourceNotFoundError);
        });

        it("should throw validation error for invalid identifier", async () => {

            // when
            const failingCall = async () => await filesController.getFileDetails(fileIdentifierInvalid);

            // then
            // exception expected
            await expect(failingCall).rejects.toThrow(InvalidRequestError);
        });
    });

    describe("Test scenarios for #getDirectories", () => {

        it("should return acceptor info", async () => {

            // given
            fileManagementFacadeMock.getAcceptorInfo.returns([acceptorInfo1, acceptorInfo2]);

            // when
            const result = await filesController.getDirectories();

            // then
            expect(result).not.toBeNull();
            expect(result.status).toBe(HttpStatus.OK);
            expect(result.sendAsRaw).toBe(false);
            expect(result.content!.acceptors.length).toBe(2);
            expect(result.content!.acceptors).toContainEqual(directoryModel1);
            expect(result.content!.acceptors).toContainEqual(directoryModel2);
        });
    });

    describe("Test scenarios for #browse", () => {

        it("should return VFS contents for root", async () => {

            // given
            fileManagementFacadeMock.browseVFS.resolves(vfsContent);

            // when
            const result = await filesController.browse(browseRequestRoot);

            // then
            expect(result).not.toBeNull();
            expect(result.status).toBe(HttpStatus.OK);
            expect(result.sendAsRaw).toBe(false);
            expect(result.content).toStrictEqual(vfsBrowserModel);

            verifyVFSPath(fileManagementFacadeMock.browseVFS, {
                currentDepth: 0,
                parent: "/",
                currentPath: undefined,
                rootRelativePath: undefined,
                acceptorRootPath: undefined
            });
        });

        it("should return VFS contents for images acceptor root", async () => {

            // given
            fileManagementFacadeMock.browseVFS.resolves(vfsContent);

            // when
            const result = await filesController.browse(browseRequestImages);

            // then
            expect(result).not.toBeNull();
            expect(result.status).toBe(HttpStatus.OK);
            expect(result.sendAsRaw).toBe(false);
            expect(result.content).toStrictEqual(vfsBrowserModel);

            verifyVFSPath(fileManagementFacadeMock.browseVFS, {
                currentDepth: 1,
                parent: "/",
                currentPath: "",
                rootRelativePath: "images",
                acceptorRootPath: "images"
            });
        });

        it("should return VFS contents for sub1 folder in images acceptor root", async () => {

            // given
            fileManagementFacadeMock.browseVFS.resolves(vfsContent);

            // when
            const result = await filesController.browse(browseRequestImagesSub1);

            // then
            expect(result).not.toBeNull();
            expect(result.status).toBe(HttpStatus.OK);
            expect(result.sendAsRaw).toBe(false);
            expect(result.content).toStrictEqual(vfsBrowserModel);

            verifyVFSPath(fileManagementFacadeMock.browseVFS, {
                currentDepth: 2,
                parent: "/images",
                currentPath: "sub1",
                rootRelativePath: "images/sub1",
                acceptorRootPath: "images"
            });
        });

        it("should return VFS contents for deep1 folder in sub1 folder in images acceptor root", async () => {

            // given
            fileManagementFacadeMock.browseVFS.resolves(vfsContent);

            // when
            const result = await filesController.browse(browseRequestImagesDeepSub);

            // then
            expect(result).not.toBeNull();
            expect(result.status).toBe(HttpStatus.OK);
            expect(result.sendAsRaw).toBe(false);
            expect(result.content).toStrictEqual(vfsBrowserModel);

            verifyVFSPath(fileManagementFacadeMock.browseVFS, {
                currentDepth: 3,
                parent: "/images/sub1",
                currentPath: "sub1/deep1",
                rootRelativePath: "images/sub1/deep1",
                acceptorRootPath: "images"
            });
        });

        function verifyVFSPath(browseVFSMock: SinonStub, expectedVFSPath: {[key in keyof VFSPath]: any}): void {

            const vfsPath = browseVFSMock.getCall(0).firstArg as VFSPath;

            expect(vfsPath.currentPath).toBe(expectedVFSPath.currentPath);
            expect(vfsPath.acceptorRootPath).toBe(expectedVFSPath.acceptorRootPath);
            expect(vfsPath.parent).toBe(expectedVFSPath.parent);
            expect(vfsPath.rootRelativePath).toBe(expectedVFSPath.rootRelativePath);
            expect(vfsPath.currentDepth).toBe(expectedVFSPath.currentDepth);
        }
    });

    describe("Test scenarios for #uploadFile", () => {

        it("should successfully upload file and return its location in header", async () => {

            // given
            fileManagementFacadeMock.upload.withArgs(fileInput).resolves(uploadedFile1);

            // when
            const result = await filesController.uploadFile(fileUploadRequestModel);

            // then
            expect(result).not.toBeNull();
            expect(result.status).toBe(HttpStatus.CREATED);
            expect(result.sendAsRaw).toBe(false);
            expect(result.content).toStrictEqual(fileModel1);
            expect(result.headers.size).toBe(1);
            expect(result.headers.get(Headers.LOCATION)).toBe(`/test/files/${uploadedFile1.pathUUID}`);
        });

        it("should throw error for invalid upload request", async () => {

            // when
            const failingCall = async () => await filesController.uploadFile(fileUploadRequestModelInvalid);

            // then
            // exception expected
            await expect(failingCall).rejects.toThrow(InvalidRequestError);
        });
    });

    describe("Test scenarios for #createDirectory", () => {

        it("should create a new directory", async () => {

            // when
            const result = await filesController.createDirectory(directoryCreationRequestModel);

            // then
            expect(result).not.toBeNull();
            expect(result.status).toBe(HttpStatus.CREATED);
            expect(result.sendAsRaw).toBe(false);
            expect(result.content).toBeUndefined();

            sinon.assert.calledWith(fileManagementFacadeMock.createDirectory, directoryCreationRequestModel.parent, directoryCreationRequestModel.name);
        });

        it("should throw error on invalid directory creation request", async () => {

            // when
            const failingCall = async () => await filesController.createDirectory(directoryCreationRequestModelInvalid);

            // then
            // exception expected
            await expect(failingCall).rejects.toThrow(InvalidRequestError);
        });
    });

    describe("Test scenarios for #updateFileMetaInfo", () => {

        it("should update metadata of existing file", async () => {

            // when
            const result = await filesController.updateFileMetaInfo(updateFileMetadataRequestModel);

            // then
            expect(result).not.toBeNull();
            expect(result.status).toBe(HttpStatus.CREATED);
            expect(result.sendAsRaw).toBe(false);
            expect(result.content).toBeUndefined();
            expect(result.headers.size).toBe(1);
            expect(result.headers.get(Headers.LOCATION)).toBe(`/test/files/${uploadedFile1.pathUUID}`);

            sinon.assert.calledWith(fileManagementFacadeMock.updateMetadata, updateFileMetadataRequestModel.pathUUID, uploadedFileUpdateAttributes)
        });

        it("should throw error on invalid metadata update request", async () => {

            // when
            const failingCall = async () => await filesController.updateFileMetaInfo(updateFileMetadataRequestModelInvalid);

            // then
            // exception expected
            await expect(failingCall).rejects.toThrow(InvalidRequestError);
        });
    });

    describe("Test scenarios for #deleteFile", () => {

        it("should remove existing file", async () => {

            // when
            const result = await filesController.deleteFile(fileIdentifier);

            // then
            expect(result).not.toBeNull();
            expect(result.status).toBe(HttpStatus.NO_CONTENT);
            expect(result.sendAsRaw).toBe(false);
            expect(result.content).toBeUndefined();

            sinon.assert.calledWith(fileManagementFacadeMock.remove, fileIdentifier.pathUUID);
        });

        it("should throw error on invalid file identifier", async () => {

            // when
            const failingCall = async () => await filesController.deleteFile(fileIdentifierInvalid);

            // then
            // exception expected
            await expect(failingCall).rejects.toThrow(InvalidRequestError);
        });
    });

    describe("Test scenarios for #controllerType", () => {

        it("should return ControllerType.FILES", () => {

            // when
            const result = filesController.controllerType();

            // then
            expect(result).toBe(ControllerType.FILES);
        });
    });
});
