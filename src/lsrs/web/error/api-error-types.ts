import {GenericError} from "../../core/error/error-types";
import {ConstraintViolation} from "../model/common";

/**
 * Error to be thrown when API-level request validation fails.
 */
export class InvalidRequestError extends GenericError {

    readonly constraintViolations: ConstraintViolation[];

    constructor(constraintViolations: ConstraintViolation[]) {
        super("Invalid request");
        this.constraintViolations = constraintViolations;
    }
}