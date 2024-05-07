import ConfigurationProvider, { AppInfoConfig } from "@app/core/config/configuration-provider";
import ActuatorController from "@app/web/controller/actuator-controller";
import { ControllerType } from "@app/web/controller/controller";
import { InfoResponse } from "@app/web/model/actuator";
import { HttpStatus } from "@app/web/model/common";
import sinon, { SinonStubbedInstance } from "sinon";

const appName = "test-app-1";
const abbreviation = "TA1";
const appInfoConfig = createAppInfoConfig();

describe("Unit tests for ActuatorController", () => {

    let configurationProviderMock: SinonStubbedInstance<ConfigurationProvider>;
    let actuatorController: ActuatorController;

    beforeEach(() => {

        configurationProviderMock = sinon.createStubInstance(ConfigurationProvider);
        configurationProviderMock.getAppInfoConfig.returns(appInfoConfig);

        actuatorController = new ActuatorController(configurationProviderMock);
    });

    describe("Test scenarios for #info", () => {

        it("should return app info with OK status", () => {

            // given
            const expectedResponse = new InfoResponse(appName, abbreviation, appInfoConfig.version, appInfoConfig.buildTime);

            // when
            const result = actuatorController.info();

            // then
            expect(result).not.toBeNull();
            expect(result.status).toBe(HttpStatus.OK);
            expect(result.content).toStrictEqual(expectedResponse);
        });
    });

    describe("Test scenarios for #health", () => {

        it("should return app health with OK status", () => {

            // when
            const result = actuatorController.health();

            // then
            expect(result).not.toBeNull();
            expect(result.status).toBe(HttpStatus.OK);
            expect(result.content!.status).toStrictEqual("UP");
        });
    });

    describe("Test scenarios for #controllerType", () => {

        it("should return ControllerType.ACTUATOR", () => {

            // when
            const result = actuatorController.controllerType();

            // then
            expect(result).toBe(ControllerType.ACTUATOR);
        });
    });
});

function createAppInfoConfig(): AppInfoConfig {

    const configMap = new Map<string, string>([
        ["appName", appName],
        ["abbreviation", abbreviation]
    ]);

    return new AppInfoConfig(configMap);
}
