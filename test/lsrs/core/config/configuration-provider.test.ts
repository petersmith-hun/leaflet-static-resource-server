import ConfigurationProvider from "../../../../src/lsrs/core/config/configuration-provider";
import {MIMEType} from "../../../../src/lsrs/core/model/file-input";

describe("Unit tests for ConfigurationProvider", () => {

    let configurationProvider: ConfigurationProvider;

    beforeEach(() => {
        configurationProvider = new ConfigurationProvider();
    });

    describe("Test scenarios for #getServerConfig", () => {

        it("should return the server config defined in test.yml", () => {

            // when
            const result = configurationProvider.getServerConfig();

            // then
            expect(result).not.toBeNull();
            expect(result.host).toBe("127.0.0.1");
            expect(result.port).toBe(9998);
        });
    });

    describe("Test scenarios for #getDatasourceConfig", () => {

        it("should return the datasource config defined in test.yml", () => {

            // when
            const result = configurationProvider.getDatasourceConfig();

            // then
            expect(result).not.toBeNull();
            expect(result.uri).toBe("sqlite::memory:");
            expect(result.username).toBe("testuser");
            expect(result.password).toBe("testpass1");
            expect(result.logging).toBe(false);
        });
    });

    describe("Test scenarios for #getStorageConfig", () => {

        it("should return the storage config defined in test.yml", () => {

            // when
            const result = configurationProvider.getStorageConfig();

            // then
            expect(result).not.toBeNull();
            expect(result.uploadPath).toBe("/tmp/storage");
            expect(result.permission).toBe(744);
            expect(result.maxAgeInDays).toBe(365);

            expect(result.acceptors.length).toBe(2);
            expect(result.acceptors[0].acceptedAs).toBe("image");
            expect(result.acceptors[0].groupRootDirectory).toBe("images");
            expect(result.acceptors[0].acceptedMIMETypes).toStrictEqual([new MIMEType("image/*")]);

            expect(result.acceptors[1].acceptedAs).toBe("other");
            expect(result.acceptors[1].groupRootDirectory).toBe("files");
            expect(result.acceptors[1].acceptedMIMETypes).toStrictEqual([
                new MIMEType("application/octet-stream"),
                new MIMEType("application/pdf")]);
        });
    });

    describe("Test scenarios for #getAppInfoConfig", () => {

        it("should return the app info config defined in test.yml", () => {

            // when
            const result = configurationProvider.getAppInfoConfig();

            // then
            expect(result).not.toBeNull();
            expect(result.appName).toBe("[TEST] Leaflet Static Resource Server");
            expect(result.abbreviation).toBe("TEST-LSRS");
        });
    });
});
