import {InMemoryCache} from "../../../src/lsrs/helper/cache";

describe("Unit tests for InMemoryCache", () => {

    let cache: InMemoryCache;

    beforeEach(() => {
        cache = new InMemoryCache();
    });

    describe("Test scenarios for #get", () => {

        it("should return undefined value from empty cache", () => {

            // when
            const result = cache.get("empty-cache-1", "key1");

            // then
            expect(result).toBeUndefined();
        });

        it("should return calculated value from empty cache", () => {

            // given
            const expectedValue = "calculated-value-1";

            // when
            const result = cache.get("empty-cache-2", "key-calculated", (_) => expectedValue);

            // then
            expect(result).toBe(expectedValue);
        });

        it("should return stored value from populated cache", () => {

            // given
            cache.put("populated-cache-1", "key1", 123);
            cache.put("populated-cache-1", "key2", 456);
            cache.put("populated-cache-1", "key3", 789);

            // when
            const result = cache.get("populated-cache-1", "key2");

            // then
            expect(result).toBe(456);
        });
    });

    describe("Test scenarios for #put", () => {

        it("should store value in cache", () => {

            // given
            const cacheName = "new-cache-1";
            const key = "key-new";
            const valueToStore = "new-value-1";

            expect(cache.get(cacheName, key)).toBeUndefined();

            // when
            cache.put(cacheName, key, valueToStore);

            // then
            expect(cache.get(cacheName, key)).toBe(valueToStore);
        });

        it("should reject storing null value in cache", () => {

            // given
            const cacheName = "new-cache-2";
            const key = "key-new-2";

            expect(cache.get(cacheName, key)).toBeUndefined();

            // when
            cache.put(cacheName, key, null);

            // then
            expect(cache.get(cacheName, key)).toBeUndefined();
        });
    });

    describe("Test scenarios for #remove", () => {

        it("should silently ignore deleting non-existing key", () => {

            // when
            cache.remove("empty-cache-3", "key-to-delete");

            // then
            // silent execution expected
        });

        it("should remove existing key", () => {

            // given
            const cacheName = "cache-to-invalidated";
            const key = "key-to-delete-1";
            const storedValue = "this-will-be-deleted";

            cache.put(cacheName, key, storedValue);
            expect(cache.get(cacheName, key)).toBe(storedValue);

            // when
            cache.remove(cacheName, key);

            // then
            expect(cache.get(cacheName, key)).toBeUndefined();
        });
    });
});
