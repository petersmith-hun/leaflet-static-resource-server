import express from "express";
import sinon, {SinonStub, SinonStubbedInstance} from "sinon";
import {GenericError} from "../../../src/lsrs/core/error/error-types";
import ControllerRegistration from "../../../src/lsrs/web/controller-registration";
import ActuatorController from "../../../src/lsrs/web/controller/actuator-controller";
import {ControllerType} from "../../../src/lsrs/web/controller/controller";
import FilesController from "../../../src/lsrs/web/controller/files-controller";
import {ParameterizedMappingHelper, ParameterlessMappingHelper} from "../../../src/lsrs/web/utility/mapping-helper";

describe("Unit tests for ControllerRegistration", () => {

    let actuatorControllerMock: SinonStubbedInstance<ActuatorController>;
    let filesControllerMock: SinonStubbedInstance<FilesController>;
    let controllerRegistration: ControllerRegistration;

    beforeEach(() => {

        actuatorControllerMock = sinon.createStubInstance(ActuatorController);
        actuatorControllerMock.controllerType.returns(ControllerType.ACTUATOR)
        filesControllerMock = sinon.createStubInstance(FilesControllerStub) as unknown as SinonStubbedInstance<FilesController>;
        filesControllerMock.controllerType.returns(ControllerType.FILES);

        controllerRegistration = new ControllerRegistration([actuatorControllerMock, filesControllerMock]);
    });

    describe("Test scenarios for #registerRoutes", () => {

        it("should register routes in Express", async () => {

            // given
            // @ts-ignore
            sinon.replace(express, "Router", sinon.fake(() => new RouterStub()));
            const parameterlessHelperStub = sinon.stub(ParameterlessMappingHelper.prototype, "register").returnsArg(0);
            const parameterizedHelperStub = sinon.stub(ParameterizedMappingHelper.prototype, "register").returnsArg(0);

            // when
            const result = controllerRegistration.registerRoutes() as unknown as RouterStub;

            // then
            await _assertRegistration(result, "get", "/actuator", "/info", actuatorControllerMock.info);
            await _assertRegistration(result, "get", "/actuator", "/health", actuatorControllerMock.health);
            await _assertRegistration(result, "get", "/files", "/", filesControllerMock.getUploadedFiles);
            await _assertRegistration(result, "post", "/files", "/", filesControllerMock.uploadFile, 2);
            await _assertRegistration(result, "get", "/files", "/directories", filesControllerMock.getDirectories);
            await _assertRegistration(result, "post", "/files", "/directories", filesControllerMock.createDirectory);
            await _assertRegistration(result, "get", "/files", "/:pathUUID", filesControllerMock.getFileDetails);
            await _assertRegistration(result, "put", "/files", "/:pathUUID", filesControllerMock.updateFileMetaInfo);
            await _assertRegistration(result, "delete", "/files", "/:pathUUID", filesControllerMock.deleteFile);
            await _assertRegistration(result, "get", "/files", "/:pathUUID/:storedFilename", filesControllerMock.download);

            parameterlessHelperStub.restore();
            parameterizedHelperStub.restore();
        });

        it("should registration fail due to unknown controller", () => {

            // given
            controllerRegistration = new ControllerRegistration([]);

            // when
            const failingCall = () => controllerRegistration.registerRoutes();

            // then
            // error expected
            expect(failingCall).toThrow(GenericError);
        });
    });

    async function _assertRegistration(router: RouterStub, method: string, controller: string, path: string, controllerMock: SinonStub, numberOfHandlers: number = 1) {

        const controllerGroup = router.root.get(controller);
        const endpoint = controllerGroup!.endpoints.find(endpoint => endpoint[0] == method && endpoint[1] == path);

        expect(endpoint).not.toBeUndefined();

        const handlers = endpoint.slice(2);

        expect(handlers.length).toBe(numberOfHandlers);

        handlers.pop()();

        await controllerMock.resolves();
        expect(controllerMock.called).toBe(true);
        controllerMock.reset();
    }
});

class RouterStub {

    endpoints: any[] = [];
    root: Map<string, RouterStub> = new Map<string, RouterStub>();

    currentPrefix: string | null = null;

    get(...args: any[]) {
        this.handleCall(args, "get");
        return this;
    }

    post(...args: any[]) {
        this.handleCall(args, "post");
        return this;
    }

    put(...args: any[]) {
        this.handleCall(args, "put");
        return this;
    }

    delete(...args: any[]) {
        this.handleCall(args, "delete");
        return this;
    }

    route(route: string) {
        this.currentPrefix = route;
        return this;
    }

    use(path: string, router: any) {
        this.root.set(path, router);
        return this;
    }

    private handleCall(args: any[], method: string) {

        if (this.currentPrefix) {
            args.unshift(this.currentPrefix);
        }
        args.unshift(method);
        this.endpoints.push(args);
    }
}

class FilesControllerStub {
    async getUploadedFiles(): Promise<void> {}
    async download(): Promise<void> {}
    async getFileDetails(): Promise<void> {}
    async getDirectories(): Promise<void> {}
    async uploadFile(): Promise<void> {}
    async createDirectory(): Promise<void> {}
    async updateFileMetaInfo(): Promise<void> {}
    async deleteFile(): Promise<void> {}
    controllerType(): any {};
}
