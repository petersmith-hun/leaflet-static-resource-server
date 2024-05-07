import { GenericError } from "@app/core/error/error-types";
import { ConstraintViolation } from "@app/web/model/common";

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