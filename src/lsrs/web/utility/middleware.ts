import { NextFunction, Request, Response } from "express";
import { InsufficientScopeError, InvalidTokenError, UnauthorizedError } from "express-oauth2-jwt-bearer";
import { v4 as UUID } from "uuid";
import {
    ConflictingResourceError,
    InaccessibleFileError,
    InvalidFileInputError,
    ResourceNotFoundError
} from "../../core/error/error-types";
import LoggerFactory from "../../helper/logger-factory";
import { InvalidRequestError } from "../error/api-error-types";
import { ConstraintViolationErrorMessage, ErrorMessage, HttpStatus } from "../model/common";

const logger = LoggerFactory.getLogger("ErrorHandlerMiddleware");

/**
 * Error type to HTTP status mapping.
 */
const errorStatusMap = new Map<string, HttpStatus>([
    [InvalidFileInputError.name, HttpStatus.BAD_REQUEST],
    [InvalidRequestError.name, HttpStatus.BAD_REQUEST],
    [UnauthorizedError.name, HttpStatus.FORBIDDEN],
    [InsufficientScopeError.name, HttpStatus.FORBIDDEN],
    [InvalidTokenError.name, HttpStatus.FORBIDDEN],
    [ResourceNotFoundError.name, HttpStatus.NOT_FOUND],
    [InaccessibleFileError.name, HttpStatus.NOT_FOUND],
    [ConflictingResourceError.name, HttpStatus.CONFLICT]
]);

/**
 * Error handler middleware for Express.
 * Generates and sends an error response model, along with setting the response status based on the received error type.
 *
 * @param error thrown error object
 * @param _request Express Request object (unused)
 * @param response Express Response object
 * @param _next Express next function (unused)
 */
export const errorHandlerMiddleware = (error: Error, _request: Request, response: Response, _next: NextFunction) => {

    const errorType = error.constructor.name;
    const errorMessage: ErrorMessage | ConstraintViolationErrorMessage = errorType == InvalidRequestError.name
        ? {message: error.message, violations: (error as InvalidRequestError).constraintViolations}
        : {message: error.message};

    if ("violations" in errorMessage) {
        logger.error(`A constraint violation occurred while processing the request: ${JSON.stringify(errorMessage.violations)}`);
    } else {
        logger.error(`An error occurred while processing the request: ${error.stack}`);
    }

    response
        .status(errorStatusMap.get(errorType) ?? HttpStatus.INTERNAL_SERVER_ERROR)
        .json(errorMessage);
};

/**
 * Creates a request tracking middleware for Express. Allows TSLog logging library to include a shared request ID
 * across the log messages created within a single web request.
 *
 * @param request Express Request object
 * @param response Express Response object
 * @param next Express next function
 */
export const requestTrackingMiddleware = async (request: Request, response: Response, next: NextFunction) => {

    const requestId = UUID();
    await LoggerFactory.asyncLocalStorage.run({ requestId }, async () => {
        return next();
    });
}
