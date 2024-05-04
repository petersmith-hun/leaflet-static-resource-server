import ConfigurationProvider, { Acceptor, StorageConfig } from "@app/core/config/configuration-provider";
import FileUploader from "@app/core/service/upload/file-uploader";
import PathUtility from "@app/core/service/upload/path-utility";
import { fileInput, initFSMocks, restoreFSMocks, uploadedFileCreateAttributes } from "@testdata/service";
import * as fs from "fs";
import { vol } from "memfs";
import sinon, { SinonStubbedInstance } from "sinon";

describe("Unit tests for FileUploader", () => {

    let configurationProviderMock: SinonStubbedInstance<ConfigurationProvider>;
    let acceptor1Mock: SinonStubbedInstance<Acceptor>;
    let acceptor2Mock: SinonStubbedInstance<Acceptor>;
    let pathUtilityMock: SinonStubbedInstance<PathUtility>;
    let fileUploader: FileUploader;

    beforeEach(() => {
        vol.fromNestedJSON({
            "/tmp/storage/images": {}
        });
        initFSMocks();

        configurationProviderMock = sinon.createStubInstance(ConfigurationProvider);
        acceptor1Mock = sinon.createStubInstance(Acceptor);
        acceptor2Mock= sinon.createStubInstance(Acceptor);
        pathUtilityMock = sinon.createStubInstance(PathUtility);

        configurationProviderMock.getStorageConfig.returns({acceptors: [acceptor1Mock, acceptor2Mock]} as unknown as StorageConfig);

        fileUploader = new FileUploader(configurationProviderMock, pathUtilityMock);
    });

    afterEach(() => {
        restoreFSMocks();
    });

    describe("Test scenarios for #upload", () => {

        it("should successfully upload file when an acceptor accepts it", () => {

            // given
            const expectedTargetFile = `/tmp/storage/images/${uploadedFileCreateAttributes.storedFilename}`;

            acceptor1Mock.accept.returns(false);
            acceptor2Mock.accept.withArgs(fileInput).returns(true);
            // @ts-ignore
            acceptor2Mock["acceptedAs"] = "image";
            pathUtilityMock.createTargetFilename.withArgs(fileInput).returns(uploadedFileCreateAttributes.storedFilename);
            pathUtilityMock.createFileRelativePath.withArgs(acceptor2Mock, fileInput, uploadedFileCreateAttributes.storedFilename).returns(uploadedFileCreateAttributes.path);
            pathUtilityMock.createFileAbsolutePath.withArgs(uploadedFileCreateAttributes.path).returns(expectedTargetFile);
            pathUtilityMock.normalizePath.withArgs(uploadedFileCreateAttributes.path).returns(uploadedFileCreateAttributes.path);

            // when
            const result = fileUploader.upload(fileInput);

            // then
            expect(result).not.toBeNull();
            expect(result!.originalFilename).toBe(fileInput.originalFilename);
            expect(result!.acceptedAs).toBe(fileInput.contentType.toString());
            expect(result!.description).toBe(fileInput.description);
            expect(result!.path).toBe(uploadedFileCreateAttributes.path);
            expect(result!.storedFilename).toBe(uploadedFileCreateAttributes.storedFilename);
            expect(result!.pathUUID.length).toBe(36);
            expect(fs.existsSync(expectedTargetFile)).toBe(true);
        });

        it("should return null if no acceptor can accept the file", () => {

            // given
            acceptor1Mock.accept.returns(false);
            acceptor2Mock.accept.returns(false);

            // when
            const result = fileUploader.upload(fileInput);

            // then
            expect(result).toBeNull();
        });
    });
});
