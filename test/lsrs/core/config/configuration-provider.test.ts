import ConfigurationProvider from "../../../../src/lsrs/core/config/configuration-provider";

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
