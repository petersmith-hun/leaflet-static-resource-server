import {AxiosResponse} from "axios";
import {Attribute} from "./test-constants";

/**
 * Component to store intermediate data during Cucumber test execution.
 */
export default class DataRegistry {

    private static readonly registry = new Map<string, any>();

    /**
     * Stores an attribute value in the data map.
     *
     * @param attribute attribute key as Attribute
     * @param value value of the attribute
     */
    public static put(attribute: Attribute, value: any) {
        this.registry.set(attribute, value);
    }

    /**
     * Stores an AxiosResponse under the Attribute.RESPONSE_ENTITY key in the data map.
     *
     * @param value AxiosResponse object to be stored
     */
    public static putResponse(value: AxiosResponse<any>) {
        this.put(Attribute.RESPONSE_ENTITY, value);
    }

    /**
     * Returns the stored value of the given attribute key.
     *
     * @param attribute attribute key as Attribute
     */
    public static get<Type>(attribute: Attribute): Type {
        return this.registry.get(attribute);
    }

    /**
     * Returns the stored AxiosResponse object.
     */
    public static getResponse<Type>(): AxiosResponse<Type> {
        return this.get(Attribute.RESPONSE_ENTITY);
    }

    /**
     * Clears the data map.
     */
    public static reset() {
        this.registry.clear();
    }
}
