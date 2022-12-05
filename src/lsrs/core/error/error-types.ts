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

    constructor(resourceType: new () => any, id: any) {
        super(`Entity of type ${resourceType.name} identified by ${id} is not found`);
    }
}

/**
 * Error to be thrown when a record to be written into the database conflicts with an existing one.
 */
export class ConflictingResourceError extends GenericError {

    constructor(resourceType: new () => any, id: any) {
        super(`Entity of type ${resourceType.name} identified by ${id} already exists`);
    }
}
