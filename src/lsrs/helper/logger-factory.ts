import {ISettingsParam, Logger} from "tslog";

/**
 * Factory component to configure logging and create loggers.
 */
export default class LoggerFactory {

    static initialized: boolean = false;
    static readonly config: ISettingsParam = {
        displayFunctionName: false,
        displayFilePath: "hidden"
    };

    static init() {
        if (!this.initialized) {
            this.initialized = true;
            // attach TLP transport here later
        }
    }

    /**
     * Creates a logger with the specified name via the existing log manager.
     *
     * @param name name of the logger (if a class is specified, its name will be used)
     * @return created Logger instance with the attached common configuration and the specified name
     */
    static getLogger(name: string | object): Logger {

        const loggerName: string = typeof name === "string"
            ? name
            : (<Function>name).name;

        return new Logger({name: loggerName, ...this.config});
    }
}

LoggerFactory.init();
