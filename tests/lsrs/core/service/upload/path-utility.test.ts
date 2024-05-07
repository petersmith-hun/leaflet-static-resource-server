import ConfigurationProvider, { Acceptor, StorageConfig } from "@app/core/config/configuration-provider";
import { FileInput } from "@app/core/model/file-input";
import PathUtility from "@app/core/service/upload/path-utility";
import sinon, { SinonStubbedInstance } from "sinon";

describe("Unit tests for PathUtility", () => {

    const uploadPath = "/tmp/storage";

    let configurationProviderMock: SinonStubbedInstance<ConfigurationProvider>;
    let pathUtility: PathUtility;

    beforeEach(() => {
        configurationProviderMock = sinon.createStubInstance(ConfigurationProvider);
        configurationProviderMock.getStorageConfig.returns({uploadPath: uploadPath} as unknown as StorageConfig);

        pathUtility = new PathUtility(configurationProviderMock);
    });

    describe("Test scenarios for #createTargetFilename", () => {

        const scenarios: {originalFilename: string, expectedTargetFilename: string}[] = [
            {originalFilename: "Test Image.png", expectedTargetFilename: "test_image.png"},
            {originalFilename: "    Test Image.png  ", expectedTargetFilename: "test_image.png"},
            {originalFilename: "Test-Image.png", expectedTargetFilename: "test-image.png"},
            {originalFilename: "Árvíztűrő   Tükörfúrógép.png", expectedTargetFilename: "arvizturo___tukorfurogep.png"},
        ];

        scenarios.forEach(scenario => {

            it(`should return ${scenario.expectedTargetFilename} for ${scenario.originalFilename}`, () => {

                // given
                const fileInput: FileInput = createFileInput(scenario.originalFilename);

                // when
                const result = pathUtility.createTargetFilename(fileInput);

                // then
                expect(result).toBe(scenario.expectedTargetFilename);
            });
        });
    });

    describe("Test scenarios for #createFileRelativePath", () => {

        const scenarios: {subFolder: string | null, expectedPath: string}[] = [
            {subFolder: null, expectedPath: "images/test_image.png"},
            {subFolder: "sub1", expectedPath: "images/sub1/test_image.png"},
            {subFolder: "sub1/sub2", expectedPath: "images/sub1/sub2/test_image.png"}
        ];

        scenarios.forEach(scenario => {

            it(`should return relative path ${scenario.expectedPath} for sub-folder ${scenario.subFolder}`, () => {

                // given
                const targetFilename = "test_image.png";
                const fileInput: FileInput = createFileInput("", scenario.subFolder);

                // when
                const result = pathUtility.createFileRelativePath(createAcceptorStub(), fileInput, targetFilename);

                // then
                expect(normalizePathResult(result)).toBe(scenario.expectedPath);
            });

        });
    });

    describe("Test scenarios for #createFileAbsolutePath", () => {

        it("should return the given path prefixed with the storage root", () => {

            // when
            const result = pathUtility.createFileAbsolutePath("images/test_image.png");

            // then
            expect(normalizePathResult(result)).toBe(`${uploadPath}/images/test_image.png`);
        });
    });

    describe("Test scenarios for #normalizePath", () => {

        const scenarios: {inputPath: string}[] = [
            {inputPath: "/tmp/storage/images/test_image.png"},
            {inputPath: "\\tmp\\storage\\images\\test_image.png"},
            {inputPath: "\\tmp\\storage/images/test_image.png"},
            {inputPath: "/tmp/storage/images\\test_image.png"}
        ];

        scenarios.forEach(scenario => {
            it(`should replace double-backslashes with single forward-slash (${scenario.inputPath})`, () => {

                // when
                const result = pathUtility.normalizePath(scenario.inputPath);

                // then
                expect(result).toBe("/tmp/storage/images/test_image.png");
            });
        });
    });

    function createFileInput(originalFilename: string, subFolder: string | null = null): FileInput {

        return {
            originalFilename: originalFilename,
            relativePath: subFolder
        } as unknown as FileInput;
    }

    function createAcceptorStub(): Acceptor {

        return {
            groupRootDirectory: "images"
        } as unknown as Acceptor;
    }

    function normalizePathResult(result: string): string {
        return result.replace(new RegExp("\\\\", "g"), "/");
    }
});
