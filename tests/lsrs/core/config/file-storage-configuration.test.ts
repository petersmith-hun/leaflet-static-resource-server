import ConfigurationProvider from "@app/core/config/configuration-provider";
import FileStorageConfiguration from "@app/core/config/file-storage-configuration";
import { fileBuffer, initFSMocks, restoreFSMocks } from "@testdata/service";
import fs from "fs";
import { vol } from "memfs";

describe("Unit tests for FileStorageConfiguration", () => {

    let fileStorageConfiguration: FileStorageConfiguration;

    beforeEach(() => {
        fileStorageConfiguration = new FileStorageConfiguration(new ConfigurationProvider());
    });

    afterEach(() => {
        restoreFSMocks();
    });

    describe("Test scenarios for #init", () => {

        it("should build a new storage from the scratch", () => {

            // given
            vol.fromNestedJSON({
                "/tmp": {}
            });
            initFSMocks();

            // when
            fileStorageConfiguration.init();

            // then
            expect(fs.existsSync("/tmp/storage/images")).toBe(true);
            expect(fs.existsSync("/tmp/storage/files")).toBe(true);
        });

        it("should build attach an existing storage", () => {

            // given
            vol.fromNestedJSON({
                "/tmp/storage": {
                    "images": {
                        "sub1": {},
                        "sub2": {
                            "test_image.png": fileBuffer
                        }
                    },
                    "files": {}
                }
            });
            initFSMocks();

            // when
            fileStorageConfiguration.init();

            // then
            expect(fs.existsSync("/tmp/storage/images")).toBe(true);
            expect(fs.existsSync("/tmp/storage/images/sub1")).toBe(true);
            expect(fs.existsSync("/tmp/storage/images/sub2")).toBe(true);
            expect(fs.existsSync("/tmp/storage/images/sub2/test_image.png")).toBe(true);
            expect(fs.existsSync("/tmp/storage/files")).toBe(true);
        });
    });
});
