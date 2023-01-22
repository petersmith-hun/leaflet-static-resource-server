import {Request, Response} from "express";
import {IncomingForm} from "formidable";
import sinon, {SinonStub, SinonStubbedInstance} from "sinon";
import {GenericError} from "../../../../src/lsrs/core/error/error-types";
import {HttpStatus} from "../../../../src/lsrs/web/model/common";
import {formidableUploadMiddleware} from "../../../../src/lsrs/web/utility/formidable-support";

describe("Unit tests for Express middleware functions", () => {

    let requestStub: Request;
    let responseStub: SinonStubbedInstance<Response>;
    let parseStub: SinonStub;

    beforeEach(() => {
        requestStub = {body: {}} as unknown as Request;
        responseStub = sinon.createStubInstance(ResponseStub) as unknown as SinonStubbedInstance<Response>;
        responseStub.status.returns(responseStub);
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
            await formidableUploadMiddleware(requestStub, responseStub, () => {});

            // then
            sinon.assert.calledWith(responseStub.json, {message: "something went wrong"});
            sinon.assert.calledWith(responseStub.status, HttpStatus.BAD_REQUEST);
        });

        it("should reject parsing on error (string passed as error)", async () => {

            // given
            parseStub = sinon.stub(IncomingForm.prototype, "parse").callsArgWith(1, "something went wrong", null, null);

            // when
            await formidableUploadMiddleware(requestStub, responseStub, () => {});

            // then
            sinon.assert.calledWith(responseStub.json, {message: "Invalid input file"});
            sinon.assert.calledWith(responseStub.status, HttpStatus.BAD_REQUEST);
        });
    });
});

class ResponseStub {
    status(status: number): any {}
    json(body: any): any{}
}
