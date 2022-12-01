import {Express, Response} from "express";
import {InjectMany, Service} from "typedi";
import {GenericError} from "../core/error/error-types";
import {ControllerToken} from "../helper/typedi-tokens";
import ActuatorController from "./controller/actuator-controller";
import {Controller, ControllerType} from "./controller/controller";
import {ResponseWrapper} from "./model/common";

/**
 * Component to handle controller registrations.
 */
@Service()
export default class ControllerRegistration {

    private readonly controllerMap: Map<ControllerType, Controller>;

    constructor(@InjectMany(ControllerToken) controllers: Controller[]) {
        this.controllerMap = new Map(controllers.map(controller => [controller.controllerType(), controller]));
    }

    /**
     * Triggers registering routes.
     *
     * @param express Express application object
     */
    public registerRoutes(express: Express): void {

        const actuatorController = this.assertAndReturnController(ControllerType.ACTUATOR) as ActuatorController;

        express
            .get("/lsrs/actuator/info", (req, res) => this.mapResponse(actuatorController.info(), res))
            .get("/lsrs/actuator/health", (req, res) => this.mapResponse(actuatorController.health(), res));
    }

    private assertAndReturnController(controllerType: ControllerType): Controller {

        const controller = this.controllerMap.get(controllerType);
        if (!controller) {
            throw new GenericError(`Failed to register controller=${controllerType} - stopping.`);
        }

        return controller;
    }

    private mapResponse(responseWrapper: ResponseWrapper<any>, response: Response) {

        response
            .status(responseWrapper.status)
            .json(responseWrapper.content);
    }
}
