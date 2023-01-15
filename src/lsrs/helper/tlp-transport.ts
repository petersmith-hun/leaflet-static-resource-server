import axios from "axios";
import {ILogObject, TTransportLogger} from "tslog/src/interfaces";

/**
 * Domain class representing an error object in the log.
 */
class ErrorLog {

    private readonly className: string;
    private readonly message: string;
    private readonly stackTrace?: string;

    constructor(error: Error) {
        this.className = error.constructor.name;
        this.message = error.message;
        this.stackTrace = typeof error.stack == "string"
            ? error.stack
            : JSON.stringify(error.stack);
    }
}

/**
 * Domain class representing a TLP API compatible log message.
 */
class TLPLogMessage {

    private static readonly _SOURCE_APPLICATION = "lsrs";

    private readonly source: string;
    private readonly threadName: string;
    private readonly timeStamp: number;
    private readonly loggerName: string;
    private readonly level: {levelStr: string};
    private readonly content: string;
    private readonly exception?: ErrorLog;
    
    /**
     * This constructor extract and converts log entry data from a TSLog log entry object.
     *
     * @param entry TSLog log entry object of type ILogObject
     */
    constructor(entry: ILogObject) {

        this.source = TLPLogMessage._SOURCE_APPLICATION;
        this.threadName = entry.requestId || "main";
        this.timeStamp = entry.date.getTime();
        this.loggerName = entry.loggerName ?? "default";
        this.level = {levelStr: entry.logLevel.toUpperCase()};
        this.content = entry.argumentsArray[0] as string;
        this.exception = this.extractException(entry);
    }

    private extractException(entry: ILogObject): ErrorLog | undefined {

        return entry.argumentsArray.length > 1
            ? new ErrorLog(entry.argumentsArray[1] as Error)
            : undefined;
    }
}

/**
 * TTransportLogger implementation for TLP log exposure. Sends the logs to TLP via Axios HTTP library as async calls.
 */
export default class TLPTransport implements TTransportLogger<(message: ILogObject) => void> {

    private readonly tlpHost: string;

    constructor(tlpHost: string) {
        this.tlpHost = tlpHost;
    }

    debug(message: ILogObject): void {
        this.sendLogToTLP(message);
    }

    error(message: ILogObject): void {
        this.sendLogToTLP(message);
    }

    fatal(message: ILogObject): void {
        this.sendLogToTLP(message);
    }

    info(message: ILogObject): void {
        this.sendLogToTLP(message);
    }

    silly(message: ILogObject): void {
        this.sendLogToTLP(message);
    }

    trace(message: ILogObject): void {
        this.sendLogToTLP(message);
    }

    warn(message: ILogObject): void {
        this.sendLogToTLP(message);
    }

    private sendLogToTLP(message: ILogObject) {

        const tlpLogMessage = new TLPLogMessage(message);

        axios.post(`${this.tlpHost}/logs`, tlpLogMessage)
            .catch(reason => {
                console.log(`Failed to send log message to TLP - reason: ${reason.message}`);
            });
    }
}