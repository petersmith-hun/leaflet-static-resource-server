import {
    ConflictingResourceError,
    GenericError,
    InaccessibleFileError,
    InvalidFileInputError,
    ResourceNotFoundError
} from "@app/core/error/error-types";
import { UploadedFile } from "@app/core/model/uploaded-file";
import LoggerFactory from "@app/helper/logger-factory";
import { InvalidRequestError } from "@app/web/error/api-error-types";
import { ConstraintViolation, HttpStatus } from "@app/web/model/common";
import { errorHandlerMiddleware, requestTrackingMiddleware } from "@app/web/utility/middleware";
import { isUUID } from "class-validator";
import { Request, Response } from "express";
import sinon, { SinonStubbedInstance } from "sinon";

describe("Unit tests for Express middleware functions", () => {

    let requestStub: Request;
    let responseStub: SinonStubbedInstance<Response>;

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
