import {Container, Inject, Service} from "typedi";
import ConfigurationProvider from "../../core/config/configuration-provider";
import {BuildTimeToken, ControllerToken, VersionToken} from "../../helper/typedi-tokens";
import {HealthResponse, InfoResponse} from "../model/actuator";
import {HttpStatus, ResponseWrapper} from "../model/common";
import {Controller, ControllerType} from "./controller";

/**
 * Actuator (application info and health-check) controller.
 */
@Service({eager: true, multiple: true, id: ControllerToken})
export default class ActuatorController implements Controller {

    private readonly configurationProvider: ConfigurationProvider;
    private infoResponse?: InfoResponse;

    constructor(@Inject() configurationProvider: ConfigurationProvider) {
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
        const version = Container.get<string>(VersionToken);
        const buildTime = Container.get<string>(BuildTimeToken);

        return new InfoResponse(appInfo.appName, appInfo.abbreviation, version, buildTime);
    }
}
