import {isUUID} from "class-validator";
import {Request, Response} from "express";
import {IncomingForm} from "formidable";
import sinon, {SinonStub, SinonStubbedInstance} from "sinon";
import {
    ConflictingResourceError,
    GenericError,
    InaccessibleFileError,
    InvalidFileInputError,
    ResourceNotFoundError
} from "../../../../src/lsrs/core/error/error-types";
import {UploadedFile} from "../../../../src/lsrs/core/model/uploaded-file";
import LoggerFactory from "../../../../src/lsrs/helper/logger-factory";
import {InvalidRequestError} from "../../../../src/lsrs/web/error/api-error-types";
import {ConstraintViolation, HttpStatus} from "../../../../src/lsrs/web/model/common";
import {
    errorHandlerMiddleware,
    formidableUploadMiddleware,
    requestTrackingMiddleware
} from "../../../../src/lsrs/web/utility/middleware";

describe("Unit tests for Express middleware functions", () => {

    let requestStub: Request;
    let responseStub: SinonStubbedInstance<Response>;
    let parseStub: SinonStub;

    beforeEach(() => {
        requestStub = {body: {}} as unknown as Request;
        responseStub = sinon.createStubInstance(ResponseStub) as unknown as SinonStubbedInstance<Response>;
        responseStub.status.returns(responseStub);
    });

    describe("Test scenarios for #errorHandlerMiddleware", () => {

        const violations: ConstraintViolation[] = [{
            message: "Invalid size",
            field: "size",
            constraint: "MaxSize"
        }];

        const scenarios: ErrorScenario[] = [
            {error: new InvalidFileInputError("Invalid file input"), expectedStatus: HttpStatus.BAD_REQUEST},
            {error: new InvalidRequestError(violations), expectedStatus: HttpStatus.BAD_REQUEST},
            {error: new ResourceNotFoundError(UploadedFile, "path-uuid"), expectedStatus: HttpStatus.NOT_FOUND},
            {error: new InaccessibleFileError("path"), expectedStatus: HttpStatus.NOT_FOUND},
            {error: new ConflictingResourceError(UploadedFile, "path-uuid"), expectedStatus: HttpStatus.CONFLICT},
            {error: new GenericError("something is wrong"), expectedStatus: HttpStatus.INTERNAL_SERVER_ERROR}
        ];

        scenarios.forEach(scenario => {
            it(`should return expected status ${scenario.expectedStatus} for error ${scenario.error.constructor.name}`, () => {

                // given
                const expectViolationsInfo = scenario.error.constructor.name == InvalidRequestError.name;

                // when
                errorHandlerMiddleware(scenario.error, requestStub, responseStub, () => {});

                // then
                sinon.assert.calledWith(responseStub.status, scenario.expectedStatus);
                sinon.assert.calledWith(responseStub.json, expectViolationsInfo
                    ? {message: scenario.error.message, violations: violations}
                    : {message: scenario.error.message});
            });
        });
    });

    describe("Test scenarios for #formidableUploadMiddleware", () => {

        afterEach(() => {
            parseStub.restore();
        });

        it("should parse file upload form and pass fields to Express Request object", async () => {

            // given
            const fields = {
                subFolder: "sub1",
                description: "file description"
            };
            const files = {
                inputFile: {
                    size: 10,
                    originalFilename: "original_filename.jpg",
                    mimetype: "image/jpg"
                }
            };

            parseStub = sinon.stub(IncomingForm.prototype, "parse").callsArgWith(1, null, fields, files);
            const nextFake = sinon.fake();

            // when
            await formidableUploadMiddleware(requestStub, responseStub, nextFake);

            // then
            expect(requestStub.body.inputFile).not.toBeNull();
            expect(requestStub.body.inputFile.size).toBe(files.inputFile.size);
            expect(requestStub.body.inputFile.originalFilename).toBe(files.inputFile.originalFilename);
            expect(requestStub.body.inputFile.mimetype).toBe(files.inputFile.mimetype);
            expect(requestStub.body.inputFile.content).not.toBeNull();
            expect(requestStub.body.subFolder).toBe(fields.subFolder);
            expect(requestStub.body.description).toBe(fields.description);

            sinon.assert.called(nextFake);
        });

        it("should reject parsing on error", async () => {

            // given
            parseStub = sinon.stub(IncomingForm.prototype, "parse").callsArgWith(1, new GenericError("something went wrong"), null, null);

            // when
            const failingCall = async () => await formidableUploadMiddleware(requestStub, responseStub, () => {});

            // then
            // exception expected
            await expect(failingCall).rejects.toThrow(GenericError);
        });
    });

    describe("Test scenarios for #requestTrackingMiddleware", () => {

        it("should store requestId in async local storage", async () => {

            // given
            let result = null;
            const next = () => result = LoggerFactory.asyncLocalStorage.getStore()?.requestId;

            // when
            await requestTrackingMiddleware(requestStub, responseStub, next);

            // then
            expect(isUUID(result)).toBe(true);
        });
    });
});

interface ErrorScenario {
    error: any
    expectedStatus: HttpStatus
}

class ResponseStub {
    status(status: number): any {}
    json(body: any): any{}
}
