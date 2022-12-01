import config from "config";
import {Service} from "typedi";

type MapValue = string | number | boolean | object | undefined;
type MapNode = Map<string, MapValue> | undefined;
type ConfigNode = "server" | "info";
type ServerConfigKey = "host" | "port";
type ActuatorConfigKey = "appName" | "abbreviation";
type ConfigKey = ServerConfigKey | ActuatorConfigKey;

/**
 * Application configuration parameters root.
 */
export class ApplicationConfig {

    readonly server: ServerConfig;
    readonly appInfo: AppInfoConfig;

    constructor(parameters: MapNode) {
        this.server = new ServerConfig(getNode(parameters, "server"));
        this.appInfo = new AppInfoConfig(getNode(parameters, "info"));
    }
}

/**
 * Express server configuration parameters.
 */
export class ServerConfig {

    readonly host: string;
    readonly port: number;

    constructor(parameters: MapNode) {
        this.host = getValue(parameters, "host");
        this.port = getValue(parameters, "port");
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
     * Returns the application info configuration.
     */
    public getAppInfoConfig(): AppInfoConfig {
        return this.applicationConfig.appInfo;
    }
}
