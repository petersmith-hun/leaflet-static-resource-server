import {AsyncLocalStorage} from "async_hooks";
import {ISettingsParam, Logger} from "tslog";
import {Container} from "typedi";
import ConfigurationProvider, {LoggingConfig} from "../core/config/configuration-provider";

/**
 * Factory component to configure logging and create loggers.
 */
export default class LoggerFactory {

    static readonly asyncLocalStorage: AsyncLocalStorage<{ requestId: string }> = new AsyncLocalStorage();

    private static initialized: boolean = false;
    private static loggingConfig: LoggingConfig;
    private static readonly config: ISettingsParam = {
        displayFunctionName: false,
        displayFilePath: "hidden",
        requestId: () => LoggerFactory.asyncLocalStorage.getStore()?.requestId
    };

    static init() {
        if (!this.initialized) {
            this.initialized = true;
            this.loggingConfig = Container.get(ConfigurationProvider).getLoggingConfig();
            this.config.minLevel = this.loggingConfig.minLevel;
            this.config.type = this.loggingConfig.enableJsonLogging
                ? "json"
                : "pretty";
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
