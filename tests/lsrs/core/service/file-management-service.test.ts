import ConfigurationProvider from "@app/core/config/configuration-provider";
import { InaccessibleFileError, InvalidFileInputError } from "@app/core/error/error-types";
import FileManagementService from "@app/core/service/file-management-service";
import FileUploader from "@app/core/service/upload/file-uploader";
import PathUtility from "@app/core/service/upload/path-utility";
import { uploadedFile1 } from "@testdata/dao";
import { acceptorInfo1, acceptorInfo2, fileBuffer, fileInput, initFSMocks, restoreFSMocks } from "@testdata/service";
import fs from "fs";
import { vol } from "memfs";
import sinon, { SinonStubbedInstance } from "sinon";

describe("Unit tests for FileManagementService", () => {

    let fileUploader: SinonStubbedInstance<FileUploader>;
    let pathUtility: SinonStubbedInstance<PathUtility>;
    let configurationProvider: ConfigurationProvider;
    let fileManagementService: FileManagementService;

    beforeEach(() => {

        vol.fromNestedJSON({
            "/tmp": {
                "storage": {
                    "images": {
                        "test1.jpg": fileBuffer,
                        "test_to_remove.jpg": fileBuffer,
                        "sub1": {},
                        "sub2": {
                            "sub4": {}
                        }
                    },
                    "files": {
                        "sub3": {}
                    }
                }
            }
        });
        vol.writeFileSync("/tmp/storage/images/test_inaccessible.jpg", "");
        vol.chmodSync("/tmp/storage/images/test_inaccessible.jpg", 0o100);

        initFSMocks(["readFile"]);

        fileUploader = sinon.createStubInstance(FileUploader);
        pathUtility = sinon.createStubInstance(PathUtility);
        configurationProvider = new ConfigurationProvider();

        fileManagementService = new FileManagementService(fileUploader, pathUtility, configurationProvider);
    });

    afterEach(() => {
        restoreFSMocks();
    });

    describe("Test scenarios for #upload", () => {

        it("should upload file successfully", () => {

            // given
            fileUploader.upload.returns(uploadedFile1);

            // when
            const result = fileManagementService.upload(fileInput);

            // then
            expect(result).not.toBeNull();
            expect(result).toStrictEqual(uploadedFile1);

            sinon.assert.calledWith(fileUploader.upload, fileInput);
        });

        it("should reject file due to 0 size", () => {

            // when
            const failingCall = () => fileManagementService.upload({...fileInput, size: 0});

            // then
            // exception expected
            expect(failingCall).toThrow(InvalidFileInputError);

            sinon.assert.notCalled(fileUploader.upload);
        });

        it("should reject file when no acceptor can accept it", () => {

            // given
            restoreFSMocks();
            fileUploader.upload.returns(null);

            // when
            const failingCall = () => fileManagementService.upload(fileInput);

            // then
            // exception expected
            expect(failingCall).toThrow(InvalidFileInputError);
        });
    });

    describe("Test scenarios for #download", () => {

        it("should successfully download accessible file", () => {

            // given
            pathUtility.createFileAbsolutePath.returns("/tmp/storage/images/test1.jpg");

            // when
            const result = fileManagementService.download("/images/test1.jpg");

            // then
            expect(result).not.toBeNull();
            expect(result).toStrictEqual(fileBuffer);
        });

        it("should throw error for non existing file", () => {

            // given
            pathUtility.createFileAbsolutePath.returns("/tmp/storage/images/non_existing.jpg");

            // when
            const failingCall = () => fileManagementService.download("/images/non_existing.jpg");

            // then
            // exception expected
            expect(failingCall).toThrow(InaccessibleFileError);
        });

        it("should throw error for inaccessible file", () => {

            // given
            pathUtility.createFileAbsolutePath.returns("/tmp/storage/images/test_inaccessible.jpg");

            // when
            const failingCall = () => fileManagementService.download("/images/test_inaccessible.jpg");

            // then
            // exception expected
            expect(failingCall).toThrow(InaccessibleFileError);
        });
    });

    describe("Test scenarios for #remove", () => {

        it("should successfully remove accessible file", () => {

            // given
            const relativePath = "/images/test_to_remove.jpg";
            pathUtility.createFileAbsolutePath.returns("/tmp/storage/images/test_to_remove.jpg");
            expect(fileManagementService.exists(relativePath)).toBe(true);

            // when
            fileManagementService.remove(relativePath);

            // then
            expect(fileManagementService.exists(relativePath)).toBe(false);
        });

        it("should throw error for non existing file", () => {

            // given
            pathUtility.createFileAbsolutePath.returns("/tmp/storage/images/non_existing.jpg");

            // when
            const failingCall = () => fileManagementService.remove("/images/non_existing.jpg");

            // then
            // exception expected
            expect(failingCall).toThrow(InaccessibleFileError);
        });
    });

    describe("Test scenarios for #createDirectory", () => {

        it("should create a new folder successfully under acceptor root", () => {

            // given
            const newDirectoryAbsolutePath = "/tmp/storage/images/new_sub";
            pathUtility.createFileAbsolutePath.returns(newDirectoryAbsolutePath);
            expect(fs.existsSync(newDirectoryAbsolutePath)).toBe(false);

            // when
            fileManagementService.createDirectory("images", "new_sub");

            // then
            expect(fs.existsSync(newDirectoryAbsolutePath)).toBe(true);
        });

        it("should create a new folder successfully under existing subfolder", () => {

            // given
            const newDirectoryAbsolutePath = "/tmp/storage/images/sub1/new_sub_2";
            pathUtility.createFileAbsolutePath.returns(newDirectoryAbsolutePath);
            expect(fs.existsSync(newDirectoryAbsolutePath)).toBe(false);

            // when
            fileManagementService.createDirectory("images/sub1", "new_sub_2");

            // then
            expect(fs.existsSync(newDirectoryAbsolutePath)).toBe(true);
        });
    });

    describe("Test scenarios for #exists", () => {

        it("should return true for existing file", () => {

            // given
            pathUtility.createFileAbsolutePath.returns("/tmp/storage/images/test1.jpg");

            // when
            const result = fileManagementService.exists("/images/test1.jpg");

            // then
            expect(result).toBe(true);
        });

        it("should return false for non-existing file", () => {

            // given
            pathUtility.createFileAbsolutePath.returns("/tmp/storage/images/non_existing.jpg");

            // when
            const result = fileManagementService.exists("/images/non_existing.jpg");

            // then
            expect(result).toBe(false);
        });
    });

    describe("Test scenarios for #getAcceptorInfo", () => {

        it("should return info about registered acceptors", () => {

            // given
            pathUtility.createFileAbsolutePath.withArgs("images").returns("/tmp/storage/images");
            pathUtility.createFileAbsolutePath.withArgs("files").returns("/tmp/storage/files");
            pathUtility.normalizePath.withArgs("sub1").returns("sub1");
            pathUtility.normalizePath.withArgs("sub2").returns("sub2");
            pathUtility.normalizePath.withArgs("sub3").returns("sub3");
            pathUtility.normalizePath.withArgs("sub2\\sub4").returns("sub2/sub4");
            pathUtility.normalizePath.withArgs("sub2/sub4").returns("sub2/sub4");

            // when
            const result = fileManagementService.getAcceptorInfo();

            // then
            expect(result.length).toBe(2);
            expect(result).toContainEqual(acceptorInfo1);
            expect(result).toContainEqual(acceptorInfo2);
        });
    });
});
