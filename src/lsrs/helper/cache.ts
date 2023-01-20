import {Logger} from "tslog";
import {Service} from "typedi";
import LoggerFactory from "./logger-factory";

/**
 * In-memory caching component.
 * Uses a 2-level map, where the first level is the cache group (its name being the key) and the second level is
 * storing arbitrary key-value pairs. Caches are automatically created upon first usage.
 */
@Service()
export class InMemoryCache {

    private readonly contents: Map<string, Map<any, any>> = new Map();
    private readonly logger: Logger = LoggerFactory.getLogger(InMemoryCache);

    /**
     * Returns a stored value from the specified cache by its key. Also, able to calculate and immediately store (and
     * return) the value in case it's missing, via the optional 'calculate' function.
     *
     * @param cacheName cache group name
     * @param key key of the item
     * @param calculate value calculation function for missing item
     * @returns either the stored (or calculated and right away stored) value or undefined if the requested key is missing and no 'calculate' function is defined
     */
    get<Key, Value>(cacheName: string, key: Key, calculate?: (key: Key) => Value): Value | undefined {

        this.ensureCache(cacheName);

        if (!this.contents.get(cacheName)!.has(key)) {
            this.logger.debug(`Cache miss for ${cacheName}/${key}`);
            const calculatedValue = calculate?.(key);
            if (calculatedValue) {
                this.put(cacheName, key, calculatedValue);
            }
        } else {
            this.logger.debug(`Cache hit for ${cacheName}/${key}`);
        }

        return this.contents.get(cacheName)!.get(key);
    }

    /**
     * Stores a value in the specified cache under the given key.
     *
     * @param cacheName cache group name
     * @param key key of the item (arbitrary type, string being recommended for the purpose)
     * @param value value to be stored (arbitrary type)
     */
    put<Key, Value>(cacheName: string, key: Key, value: Value): void {

        this.ensureCache(cacheName);

        if (value) {
            this.logger.debug(`Cache put for ${cacheName}/${key}`);
            this.contents.get(cacheName)!.set(key, value);
        } else {
            this.logger.warn(`Rejecting putting empty value into ${cacheName}/${key}`);
        }
    }

    /**
     * Removes the identified value (by its) from the specified cache.
     *
     * @param cacheName cache group name
     * @param key key of the item
     */
    remove<Key>(cacheName: string, key: Key): void {
        this.contents.get(cacheName)?.delete(key);
        this.logger.debug(`Cache invalidation for ${cacheName}/${key}`);
    }

    private ensureCache(cacheName: string): void {

        if (!this.contents.has(cacheName)) {
            this.contents.set(cacheName, new Map<any, any>());
            this.logger.info(`Cache '${cacheName}' initialized`);
        }
    }
}
