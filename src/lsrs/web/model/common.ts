/**
 * Supported HTTP statuses.
 */
export enum HttpStatus {
    OK = 200
}

/**
 * Wrapper class for controller responses. Contains the response status and the content of the response as T.
 *
 * @param <T> type of the response content
 */
export class ResponseWrapper<T> {

    readonly status: HttpStatus;
    readonly content: T;

    constructor(status: HttpStatus, content: T) {
        this.status = status;
        this.content = content;
    }
}
