/**
 * Marker interface for controller implementations.
 */
export interface Controller {

    /**
     * Returns the endpoint group type of the given controller;
     *
     * @returns controller name
     */
    controllerType(): ControllerType;
}

/**
 * Supported controller types (endpoint groups).
 */
export enum ControllerType {
    ACTUATOR = "actuator"
}
