/**
 * Basic error class.
 */
export class GenericError extends Error {

    constructor(message: string) {
        super(message);
    }
}

/**
 * Error to be thrown when a requested resource is not found.
 */
export class ResourceNotFoundError extends GenericError {

    constructor(resourceType: object, id: any) {
        super(`Entity of ${resourceType.constructor.name} identified by ${id} is not found`);
    }
}
