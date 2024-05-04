import { ResourceNotFoundError } from "@app/core/error/error-types";
import { UploadedFile } from "@app/core/model/uploaded-file";
import { header, Headers, HttpStatus, ResponseWrapper } from "@app/web/model/common";
import { FileIdentifier, FileModel } from "@app/web/model/files";
import { ParameterizedMappingHelper, ParameterlessMappingHelper } from "@app/web/utility/mapping-helper";
import { uploadedFile1 } from "@testdata/dao";
import { fileBuffer } from "@testdata/service";
import { fileModel1 } from "@testdata/web";
import { Request, Response } from "express";
import sinon, { SinonStubbedInstance } from "sinon";

describe("Unit tests for mapping helper functions", () => {

    let requestStub: Request;
    let responseStub: SinonStubbedInstance<Response>;

    beforeEach(() => {
        requestStub = {} as unknown as Request;
        responseStub = sinon.createStubInstance(ResponseStub) as unknown as SinonStubbedInstance<Response>;
    });

    describe("Test scenarios for ParameterlessMappingHelper#register", () => {

        it("should map successful JSON response without headers", async () => {

            // given
            const responseWrapper: ResponseWrapper<FileModel> = new ResponseWrapper<FileModel>(HttpStatus.OK, fileModel1);
            const parameterlessMappingHelper = new ParameterlessMappingHelper();

            // when
            const result = parameterlessMappingHelper.register(async () => responseWrapper);
            await result(requestStub, responseStub, () => {});

            // then
            sinon.assert.calledWith(responseStub.status, HttpStatus.OK);
            sinon.assert.calledWith(responseStub.json, fileModel1);
            sinon.assert.notCalled(responseStub.send);
            sinon.assert.notCalled(responseStub.setHeader);
        });

        it("should map successful raw response with headers", async () => {

            // given
            const responseWrapper: ResponseWrapper<Buffer> = new ResponseWrapper<Buffer>(HttpStatus.OK, fileBuffer, [
                header(Headers.CONTENT_TYPE, "image/jpg"),
                header(Headers.CONTENT_LENGTH, 100)
            ], true);
            const parameterlessMappingHelper = new ParameterlessMappingHelper();

            // when
            const result = parameterlessMappingHelper.register(async () => responseWrapper);
            await result(requestStub, responseStub, () => {});

            // then
            sinon.assert.calledWith(responseStub.status, HttpStatus.OK);
            sinon.assert.calledWith(responseStub.send, fileBuffer);
            sinon.assert.calledWith(responseStub.setHeader, Headers.CONTENT_TYPE, "image/jpg");
            sinon.assert.calledWith(responseStub.setHeader, Headers.CONTENT_LENGTH, 100);
            sinon.assert.notCalled(responseStub.json);
        });

        it("should map successful empty response", async () => {

            // given
            const responseWrapper: ResponseWrapper<void> = new ResponseWrapper<void>(HttpStatus.CREATED);
            const parameterlessMappingHelper = new ParameterlessMappingHelper();

            // when
            const result = parameterlessMappingHelper.register(async () => responseWrapper);
            await result(requestStub, responseStub, () => {});

            // then
            sinon.assert.calledWith(responseStub.status, HttpStatus.CREATED);
            sinon.assert.called(responseStub.send);
            sinon.assert.notCalled(responseStub.json);
        });

        it("should handle error by passing it forward via next function", async () => {

            // given
            const nextFake = sinon.fake();
            const parameterlessMappingHelper = new ParameterlessMappingHelper();
            const resourceNotFoundError = new ResourceNotFoundError(UploadedFile, "path-uuid");

            // when
            const result = parameterlessMappingHelper.register(async () => {throw resourceNotFoundError});
            await result(requestStub, responseStub, nextFake);

            // then
            sinon.assert.notCalled(responseStub.status);
            sinon.assert.notCalled(responseStub.send);
            sinon.assert.notCalled(responseStub.json);
            sinon.assert.calledWith(nextFake, resourceNotFoundError);
        });
    });

    describe("Test scenarios for ParameterizedMappingHelper#register", () => {

        it("should successfully map request model from Express request", async () => {

            // given
            const fileIdentifierRequest = {
                pathUUID: uploadedFile1.pathUUID
            };
            requestStub = {
                params: fileIdentifierRequest
            } as unknown as Request;
            const parameterizedMappingHelper = new ParameterizedMappingHelper(FileIdentifier);

            // when
            const result = parameterizedMappingHelper.register(async (fileIdentifier) => new ResponseWrapper<FileIdentifier>(HttpStatus.OK, fileIdentifier));
            await result(requestStub, responseStub, () => {});

            // then
            sinon.assert.calledWith(responseStub.status, HttpStatus.OK);
            sinon.assert.calledWith(responseStub.json, new FileIdentifier(requestStub));
        });

        it("should handle input mapping errors", async () => {

            // given
            const nextFake = sinon.fake();
            const parameterizedMappingHelper = new ParameterizedMappingHelper(FileIdentifier);

            // when
            const result = parameterizedMappingHelper.register(async (fileIdentifier) => new ResponseWrapper<FileIdentifier>(HttpStatus.OK, fileIdentifier));
            // @ts-ignore
            await result(null, responseStub, nextFake);

            // then
            sinon.assert.notCalled(responseStub.status);
            sinon.assert.notCalled(responseStub.json);
            sinon.assert.called(nextFake);
        });
    });
});

class ResponseStub {
    status(status: number): any {}
    send(body?: any): any {}
    json(body: any): any{}
    setHeader(key: string, value: any): any {}
}
