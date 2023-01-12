/**
 * Supported HTTP statuses.
 */
export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    INTERNAL_SERVER_ERROR = 500
}

/**
 * Supported HTTP headers.
 */
export enum Headers {
    CACHE_CONTROL = "Cache-Control",
    CONTENT_LENGTH = "Content-Length",
    CONTENT_TYPE = "Content-Type",
    LOCATION = "Location"
}

/**
 * Supported OAuth scopes.
 */
export enum Scope {
    READ_FILES = "read:files",
    WRITE_FILES = "write:files"
}

/**
 * Wrapper class for controller responses. Contains the response status and the content of the response as T.
 *
 * @param <T> type of the response content
 */
export class ResponseWrapper<T> {

    readonly status: HttpStatus;
    readonly content?: T;
    readonly headers: Map<Headers, string | number>;
    readonly sendAsRaw: boolean;

    constructor(status: HttpStatus, content?: T, headers: [Headers, string | number][] = [], sendAsRaw: boolean = false) {
        this.status = status;
        this.content = content;
        this.headers = new Map(headers);
        this.sendAsRaw = sendAsRaw;
    }
}

/**
 * Model class for constraint violation API responses.
 */
export interface ConstraintViolation {

    field: string;
    constraint: string;
    message: string;
}

/**
 * Model class for basic error API responses.
 */
export interface ErrorMessage {

    message: string;
}

/**
 * Model class for constraint violation error API responses.
 */
export interface ConstraintViolationErrorMessage extends ErrorMessage {

    violations: ConstraintViolation[];
}

/**
 * Convenience function for passing a header entry into the ResponseWrapper.
 *
 * @param key header entry key as Headers enum constant
 * @param value header entry value as string or number
 */
export function header(key: Headers, value: string | number): [Headers, string | number] {
    return [key, value];
}
