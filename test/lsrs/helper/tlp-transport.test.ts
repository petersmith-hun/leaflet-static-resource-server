import axios from "axios";
import sinon, {SinonStub} from "sinon";
import {ILogObject} from "tslog/src/interfaces";
import {GenericError} from "../../../src/lsrs/core/error/error-types";
import TLPTransport from "../../../src/lsrs/helper/tlp-transport";

describe("Unit tests for TLPTransport", () => {

    let axiosMock: SinonStub;
    let tlpTransport: TLPTransport;

    beforeAll(() => {
        axiosMock = sinon.stub(axios, "post");
    });

    beforeEach(() => {
        axiosMock.returns(new Promise(() => {}));
        tlpTransport = new TLPTransport("http://localhost:9999");
    });

    afterEach(() => {
        axiosMock.reset();
    });

    describe("Test scenarios for #sendLogToTLP", () => {

        it("should create a log message from main thread without logger name and without exception and send", () => {

            // given
            const logObject: Partial<ILogObject> = {
                argumentsArray: ["This is a log message"],
                date: new Date(),
                hostname: "",
                logLevel: "info",
                logLevelId: 3
            };

            // when
            tlpTransport.info(logObject as ILogObject);

            // then
            const axiosCall = axiosMock.getCall(0);
            const url = axiosCall.args[0];
            const message = axiosCall.args[1];

            expect(url).toBe("http://localhost:9999/logs");
            expect(message.content).toBe(logObject.argumentsArray![0]);
            expect(message.exception).toBeUndefined();
            expect(message.level).toStrictEqual({levelStr: "INFO"});
            expect(message.loggerName).toBe("default");
            expect(message.source).toBe("lsrs");
            expect(message.threadName).toBe("main");
            expect(message.timeStamp).toBe(logObject.date!.getTime());
        });

        it("should create a log message from request thread with logger name and with exception (string stack) and send", () => {

            // given
            const genericError = new GenericError("Something went wrong");
            genericError.stack = "error stack";

            const logObject: Partial<ILogObject> = {
                argumentsArray: ["This is an error log", genericError],
                date: new Date(),
                hostname: "",
                logLevel: "error",
                logLevelId: 5,
                loggerName: "SomeOtherLogger",
                requestId: "some-request-id"
            };

            // when
            tlpTransport.error(logObject as ILogObject);

            // then
            const axiosCall = axiosMock.getCall(0);
            const url = axiosCall.args[0];
            const message = axiosCall.args[1];

            expect(url).toBe("http://localhost:9999/logs");
            expect(message.content).toBe(logObject.argumentsArray![0]);
            expect(message.level).toStrictEqual({levelStr: "ERROR"});
            expect(message.loggerName).toBe(logObject.loggerName);
            expect(message.source).toBe("lsrs");
            expect(message.threadName).toBe(logObject.requestId);
            expect(message.timeStamp).toBe(logObject.date!.getTime());
            expect(message.exception.className).toBe("GenericError");
            expect(message.exception.message).toBe(genericError.message);
            expect(message.exception.stackTrace).toBe(genericError.stack);
        });

        it("should create a log message from request thread with logger name and with exception (complex stack) and send", () => {

            // given
            const genericError = new GenericError("Something went wrong");
            // @ts-ignore
            genericError.stack = ["stackTrace line #1", "stackTrace line #2"];

            const logObject: Partial<ILogObject> = {
                argumentsArray: ["This is an other error log", genericError],
                date: new Date(),
                hostname: "",
                logLevel: "error",
                logLevelId: 5,
                loggerName: "SomeOtherLogger2",
                requestId: "some-request-id2"
            };

            // when
            tlpTransport.error(logObject as ILogObject);

            // then
            const axiosCall = axiosMock.getCall(0);
            const url = axiosCall.args[0];
            const message = axiosCall.args[1];

            expect(url).toBe("http://localhost:9999/logs");
            expect(message.content).toBe(logObject.argumentsArray![0]);
            expect(message.level).toStrictEqual({levelStr: "ERROR"});
            expect(message.loggerName).toBe(logObject.loggerName);
            expect(message.source).toBe("lsrs");
            expect(message.threadName).toBe(logObject.requestId);
            expect(message.timeStamp).toBe(logObject.date!.getTime());
            expect(message.exception.className).toBe("GenericError");
            expect(message.exception.message).toBe(genericError.message);
            expect(message.exception.stackTrace).toBe("[\"stackTrace line #1\",\"stackTrace line #2\"]");
        });
    });

    describe("Test scenarios for log level methods", () => {

        const scenarios: {methodName: string, call: (message: ILogObject) => void}[] = [
            {methodName: "debug", call: (message) => tlpTransport.debug(message)},
            {methodName: "error", call: (message) => tlpTransport.error(message)},
            {methodName: "fatal", call: (message) => tlpTransport.fatal(message)},
            {methodName: "info", call: (message) => tlpTransport.info(message)},
            {methodName: "silly", call: (message) => tlpTransport.silly(message)},
            {methodName: "trace", call: (message) => tlpTransport.trace(message)},
            {methodName: "warn", call: (message) => tlpTransport.warn(message)}
        ];

        scenarios.forEach(scenario => {
            it(`should proxy the call to the #sendLogToTLP method when ${scenario.methodName}`, () => {

                // given
                const logObject: Partial<ILogObject> = {
                    argumentsArray: ["This is a log message"],
                    date: new Date(),
                    hostname: "",
                    logLevel: "info",
                    logLevelId: 3
                };

                // when
                scenario.call(logObject as ILogObject);

                // then
                const axiosCall = axiosMock.getCall(0);
                const url = axiosCall.args[0];
                const message = axiosCall.args[1];

                expect(url).toBe("http://localhost:9999/logs");
                expect(message.constructor.name).toBe("TLPLogMessage");
            });
        });
    });
});
