import * as fs from "fs";
import {default as mockfs} from "mock-fs";
import ConfigurationProvider from "../../../../src/lsrs/core/config/configuration-provider";
import FileStorageConfiguration from "../../../../src/lsrs/core/config/file-storage-configuration";
import {fileBuffer} from "../service/service.testdata";

describe("Unit tests for FileStorageConfiguration", () => {

    let fileStorageConfiguration: FileStorageConfiguration;

    beforeEach(() => {
        fileStorageConfiguration = new FileStorageConfiguration(new ConfigurationProvider());
    });

    afterEach(() => {
        mockfs.restore();
    });

    describe("Test scenarios for #init", () => {

        it("should build a new storage from the scratch", () => {

            // given
            mockfs({
                "/tmp": mockfs.directory({mode: 0o777})
            });

            // when
            fileStorageConfiguration.init();

            // then
            expect(fs.existsSync("/tmp/storage/images")).toBe(true);
            expect(fs.existsSync("/tmp/storage/files")).toBe(true);
        });

        it("should build attach an existing storage", () => {

            // given
            mockfs({
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
