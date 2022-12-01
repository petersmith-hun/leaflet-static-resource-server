import {Express, Request, Response} from "express";
import sinon, {SinonStub, SinonStubbedInstance} from "sinon";
import {GenericError} from "../../../src/lsrs/core/error/error-types";
import ControllerRegistration from "../../../src/lsrs/web/controller-registration";
import ActuatorController from "../../../src/lsrs/web/controller/actuator-controller";
import {ControllerType} from "../../../src/lsrs/web/controller/controller";
import {HealthResponse, InfoResponse} from "../../../src/lsrs/web/model/actuator";
import {HttpStatus, ResponseWrapper} from "../../../src/lsrs/web/model/common";

describe("Unit tests for ControllerRegistration", () => {

    let requestMock: SinonStubbedInstance<Request>;
    let responseMock: SinonStubbedInstance<Response>;
    let expressMock: SinonStubbedInstance<Express>;
    let actuatorControllerMock: SinonStubbedInstance<ActuatorController>;
    let controllerRegistration: ControllerRegistration;

    beforeEach(() => {

        requestMock = (sinon.createStubInstance(RequestStub) as unknown) as SinonStubbedInstance<Request>;
        responseMock = (sinon.createStubInstance(ResponseStub) as unknown) as SinonStubbedInstance<Response>;
        expressMock = (sinon.createStubInstance(ExpressStub) as unknown) as SinonStubbedInstance<Express>;
        actuatorControllerMock = sinon.createStubInstance(ActuatorController);
        actuatorControllerMock.controllerType.returns(ControllerType.ACTUATOR);

        controllerRegistration = new ControllerRegistration([actuatorControllerMock]);
    });

    describe("Test scenarios for #registerRoutes", () => {

        it("should register routes in Express", () => {

            // given
            const infoResponse = new InfoResponse("app1", "app", "1.0.0");
            const healthResponse = new HealthResponse();
            const infoResponseResponseWrapper = new ResponseWrapper(HttpStatus.OK, infoResponse);
            const healthResponseResponseWrapper = new ResponseWrapper(HttpStatus.OK, healthResponse);

            expressMock.get.returns(expressMock);
            responseMock.status.returns(responseMock);
            actuatorControllerMock.info.returns(infoResponseResponseWrapper);
            actuatorControllerMock.health.returns(healthResponseResponseWrapper);

            // when
            controllerRegistration.registerRoutes(expressMock);

            // then
            _assertControllerRegistered(expressMock.get, "/lsrs/actuator/info", actuatorControllerMock.info, infoResponseResponseWrapper);
            _assertControllerRegistered(expressMock.get, "/lsrs/actuator/health", actuatorControllerMock.health, healthResponseResponseWrapper);
        });

        it("should registration fail due to unknown controller", () => {

            // given
            controllerRegistration = new ControllerRegistration([]);

            // when
            const failingCall = () => controllerRegistration.registerRoutes(expressMock);

            // then
            // error expected
            expect(failingCall).toThrow(GenericError);
        });
    });

    function _assertControllerRegistered(expectedExpressCall: SinonStub, controllerPath: string, controllerMock: SinonStub, expectedResponse: ResponseWrapper<any>) {

        let callArgs: ExpressRegistration | null = _extractCall(expectedExpressCall, controllerPath);
        expect(callArgs).not.toBeNull();
        _assertController(callArgs!.controllerFunction, controllerMock, expectedResponse);
    }

    function _extractCall(expectedExpressCall: SinonStub, controllerPath: string): ExpressRegistration | null {

        for (let index = 0; index < expectedExpressCall.callCount; index++) {
            let currentCallArgs = new ExpressRegistration(expectedExpressCall.getCall(index).args);
            if (currentCallArgs.path === controllerPath) {
                return currentCallArgs;
            }
        }

        return null;
    }

    function _assertController(callArgs: ExpressControllerFunction, controllerMock: SinonStub, expectedResponse: ResponseWrapper<any>) {

        callArgs(requestMock, responseMock);
        expect(controllerMock.called).toBe(true);
        sinon.assert.calledWith(responseMock.status, expectedResponse.status);
        sinon.assert.calledWith(responseMock.json, expectedResponse.content);
        controllerMock.reset();
    }
});

class ExpressStub {
    get(): any {}
}

class ResponseStub {
    status(status: number): any {}
    json(content: any): any {}
}

class RequestStub {
    get(): any {}
}

type ExpressControllerFunction = (request: Request, response: Response) => void;

class ExpressRegistration {

    path: string;
    controllerFunction: ExpressControllerFunction;

    constructor(callArgs: any[]) {
        this.path = callArgs[0];
        this.controllerFunction = callArgs[1];
    }
}
