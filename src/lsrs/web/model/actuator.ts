/**
 * Info actuator endpoint response model.
 */
export class InfoResponse {

    readonly appName: string;
    readonly abbreviation: string;
    readonly version: string;

    constructor(appName: string, abbreviation: string, version: string) {
        this.appName = appName;
        this.abbreviation = abbreviation;
        this.version = version;
    }
}

/**
 * Health actuator endpoint response model.
 */
export class HealthResponse {

    readonly status: string = "UP";
}
