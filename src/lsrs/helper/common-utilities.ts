/**
 * Generic optional type, aliasing a type that is either the provided generic type or null.
 */
export type Optional<Type> = Type | null | undefined;

/**
 * Interface for configuration classes to group and execute common tasks on them.
 */
export interface Configuration {

    /**
     * Executes initialization steps of the marked configuration class.
     */
    init(): void;
}

