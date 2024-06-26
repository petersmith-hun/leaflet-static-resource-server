import ConfigurationProvider, { configurationProvider } from "@app/core/config/configuration-provider";
import { Controller, ControllerType } from "@app/web/controller/controller";
import { HealthResponse, InfoResponse } from "@app/web/model/actuator";
import { HttpStatus, ResponseWrapper } from "@app/web/model/common";

/**
 * Actuator (application info and health-check) controller.
 */
export default class ActuatorController implements Controller {

    private readonly configurationProvider: ConfigurationProvider;
    private infoResponse?: InfoResponse;

    constructor(configurationProvider: ConfigurationProvider) {
        this.configurationProvider = configurationProvider;
    }

    /**
     * GET /actuator/info
     *
     * Returns the configured application info data (lsrs.info.* parameters).
     *
     * @returns application info as InfoResponse wrapped in ResponseWrapper
     */
    public info(): ResponseWrapper<InfoResponse> {

        if (!this.infoResponse) {
            this.infoResponse = this.createInfoResponse();
        }

        return new ResponseWrapper(HttpStatus.OK, this.infoResponse);
    }

    /**
     * GET /actuator/health
     *
     * Returns the configured application health status.
     *
     * @returns application health status as HealthResponse wrapped in ResponseWrapper
     */
    public health(): ResponseWrapper<HealthResponse> {
        return new ResponseWrapper(HttpStatus.OK, new HealthResponse());
    }

    controllerType(): ControllerType {
        return ControllerType.ACTUATOR;
    }

    private createInfoResponse(): InfoResponse {

        const appInfo = this.configurationProvider.getAppInfoConfig();

        return new InfoResponse(appInfo.appName, appInfo.abbreviation, appInfo.version, appInfo.buildTime);
    }
}

export const actuatorController = new ActuatorController(configurationProvider);
