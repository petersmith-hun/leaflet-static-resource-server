import config from "config";
import {Service} from "typedi";
import {FileInput, MIMEType} from "../model/file-input";

type MapValue = string | number | boolean | object | undefined;
type MapNode = Map<string, MapValue> | undefined;
type ConfigNode = "server" | "datasource" | "storage" | "auth" | "logging" | "info";
type ServerConfigKey = "context-path" | "host" | "port";
type DatasourceConfigKey = "uri" | "username" | "password" | "logging";
type StorageConfigKey = "upload-path" | "max-age-in-days" | "permission" | "acceptors";
type AuthConfigKey = "oauth-issuer" | "oauth-audience";
type AcceptorConfigKey = "accepted-as" | "group-root-directory" | "accepted-mime-types";
type AcceptorConfigNode = { [Key in AcceptorConfigKey]: string | string[] };
type LoggingConfigKey = "tlp-logging";
type TLPLoggingConfigKey = "enabled" | "host";
type ActuatorConfigKey = "appName" | "abbreviation";
type ConfigKey = ServerConfigKey | DatasourceConfigKey | StorageConfigKey | AcceptorConfigKey | AuthConfigKey | LoggingConfigKey | TLPLoggingConfigKey | ActuatorConfigKey;

/**
 * Application configuration parameters root.
 */
export class ApplicationConfig {

    readonly server: ServerConfig;
    readonly datasource: DatasourceConfig;
    readonly storage: StorageConfig;
    readonly auth: AuthConfig;
    readonly logging: LoggingConfig;
    readonly appInfo: AppInfoConfig;

    constructor(parameters: MapNode) {
        this.server = new ServerConfig(getNode(parameters, "server"));
        this.datasource = new DatasourceConfig(getNode(parameters, "datasource"));
        this.storage = new StorageConfig(getNode(parameters, "storage"));
        this.auth = new AuthConfig(getNode(parameters, "auth"));
        this.logging = new LoggingConfig(getNode(parameters, "logging"));
        this.appInfo = new AppInfoConfig(getNode(parameters, "info"));
    }
}

/**
 * Express server configuration parameters.
 */
export class ServerConfig {

    readonly contextPath: string;
    readonly host: string;
    readonly port: number;

    constructor(parameters: MapNode) {
        this.contextPath = getValue(parameters, "context-path", "/");
        this.host = getValue(parameters, "host");
        this.port = getValue(parameters, "port");
    }
}

/**
 * Datasource configuration parameters.
 */
export class DatasourceConfig {

    readonly uri: string;
    readonly username: string;
    readonly password: string;
    readonly logging: boolean;

    constructor(parameters: MapNode) {
        this.uri = getValue(parameters, "uri");
        this.username = getValue(parameters, "username");
        this.password = getValue(parameters, "password");
        this.logging = getValue(parameters, "logging", false);
    }
}

/**
 * Acceptor configuration.
 */
export class Acceptor {

    readonly acceptedAs: string;
    readonly groupRootDirectory: string;
    readonly acceptedMIMETypes: MIMEType[];

    constructor(parameters: AcceptorConfigNode) {
        this.acceptedAs = getAcceptorValue(parameters, "accepted-as");
        this.groupRootDirectory = getAcceptorValue(parameters, "group-root-directory");
        this.acceptedMIMETypes = (getAcceptorValue(parameters, "accepted-mime-types") as string[])
            .map(mime => new MIMEType(mime));
    }

    /**
     * Attempts accepting a given file by its MIME type.
     *
     * @param fileInput FileInput object containing information about the file to be uploaded
     */
    accept(fileInput: FileInput): boolean {
        return this.acceptedMIMETypes.some(mime => mime.isCompatibleWith(fileInput.contentType));
    }
}

/**
 * Storage config parameters.
 */
export class StorageConfig {

    readonly uploadPath: string;
    readonly maxAgeInDays: number;
    readonly permission: string;
    readonly acceptors: Acceptor[];

    constructor(parameters: MapNode) {
        this.uploadPath = getValue(parameters, "upload-path");
        this.maxAgeInDays = getValue(parameters, "max-age-in-days");
        this.permission = getValue(parameters, "permission");
        this.acceptors = (getValue(parameters, "acceptors") as Array<AcceptorConfigNode>)
            .map(acceptor => new Acceptor(acceptor));
    }
}

/**
 * Authorization config parameters.
 */
export class AuthConfig {

    readonly oauthIssuer: string;
    readonly oauthAudience: string;

    constructor(parameters: MapNode) {
        this.oauthIssuer = getValue(parameters, "oauth-issuer");
        this.oauthAudience = getValue(parameters, "oauth-audience");
    }
}

/**
 * Logging configuration parameters.
 */
export class LoggingConfig {

    readonly tlpLoggingEnabled: boolean;
    readonly tlpHost: string;

    constructor(parameters: MapNode) {
        const tlpLogging: MapNode = getValue(parameters, "tlp-logging");
        this.tlpLoggingEnabled = getValue(tlpLogging, "enabled", false);
        this.tlpHost = getValue(tlpLogging, "host");
    }
}

/**
 * Application info config parameters;
 */
export class AppInfoConfig {

    readonly appName: string;
    readonly abbreviation: string;

    constructor(parameters: MapNode) {
        this.appName = getValue(parameters, "appName");
        this.abbreviation = getValue(parameters, "abbreviation");
    }
}

function getNode(parameters: MapNode, node: ConfigNode): MapNode {
    return parameters?.get(node) as MapNode;
}

function getValue<Type>(parameters: MapNode, key: ConfigKey, defaultValue: string | number | boolean = "unknown"): Type {
    return (parameters?.has(key)
        ? parameters.get(key)
        : defaultValue) as Type;
}

function getAcceptorValue<Type>(parameters: AcceptorConfigNode, key: AcceptorConfigKey): Type {
    return parameters[key] as Type;
}

/**
 * Wrapper component for config.get calls.
 */
@Service()
export default class ConfigurationProvider {

    private readonly applicationConfig: ApplicationConfig;

    constructor() {
        const parameters: MapNode = config.get("lsrs");
        this.applicationConfig = new ApplicationConfig(parameters);
    }

    /**
     * Returns the Express server configuration.
     */
    public getServerConfig(): ServerConfig {
        return this.applicationConfig.server;
    }

    /**
     * Returns the datasource configuration.
     */
    public getDatasourceConfig(): DatasourceConfig {
        return this.applicationConfig.datasource;
    }

    /**
     * Returns the storage configuration.
     */
    public getStorageConfig(): StorageConfig {
        return this.applicationConfig.storage;
    }

    /**
     * Returns the authorization configuration.
     */
    public getAuthConfig(): AuthConfig {
        return this.applicationConfig.auth;
    }

    /**
     * Returns the logging configuration.
     */
    public getLoggingConfig(): LoggingConfig {
        return this.applicationConfig.logging;
    }

    /**
     * Returns the application info configuration.
     */
    public getAppInfoConfig(): AppInfoConfig {
        return this.applicationConfig.appInfo;
    }
}
