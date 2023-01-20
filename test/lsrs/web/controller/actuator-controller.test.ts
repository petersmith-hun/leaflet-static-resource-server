import sinon, {SinonStubbedInstance} from "sinon";
import {Container} from "typedi";
import ConfigurationProvider, {AppInfoConfig} from "../../../../src/lsrs/core/config/configuration-provider";
import {BuildTimeToken, VersionToken} from "../../../../src/lsrs/helper/typedi-tokens";
import ActuatorController from "../../../../src/lsrs/web/controller/actuator-controller";
import {ControllerType} from "../../../../src/lsrs/web/controller/controller";
import {InfoResponse} from "../../../../src/lsrs/web/model/actuator";
import {HttpStatus} from "../../../../src/lsrs/web/model/common";

const version = "1.0.0-test";
const buildTime = "2023-01-20";
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
            Container.set(VersionToken, version);
            Container.set(BuildTimeToken, buildTime)
            const expectedResponse = new InfoResponse(appName, abbreviation, version, buildTime);

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
