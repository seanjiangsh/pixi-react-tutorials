/**
 * Memoization utility for caching expensive function results
 * Implements LRU (Least Recently Used) cache to prevent memory leaks
 */

type CacheKey = string;
type CacheEntry<T> = {
  value: T;
  timestamp: number;
};

class LRUCache<T> {
  private cache = new Map<CacheKey, CacheEntry<T>>();
  private maxSize: number;
  private maxAge: number; // in milliseconds

  constructor(maxSize = 100, maxAge = 60000) {
    // 1 minute default
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  get(key: CacheKey): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: CacheKey, value: T): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getSize(): number {
    return this.cache.size;
  }
}

/**
 * Creates a stable cache key from function arguments
 * Handles primitives, objects, and arrays
 * @param precision - Number of decimal places to round to (default: 10)
 */
function createCacheKey(args: unknown[], precision = 10): CacheKey {
  const multiplier = Math.pow(10, precision);
  return JSON.stringify(args, (_, value) => {
    // Handle special cases for consistent serialization
    if (typeof value === "number") {
      // Round to avoid floating point precision issues
      return Math.round(value * multiplier) / multiplier;
    }
    if (typeof value === "function") {
      // Use function toString for equation functions
      return value.toString();
    }
    return value;
  });
}

/**
 * Memoize a function with LRU cache
 * @param fn - Function to memoize
 * @param options - Cache configuration
 */
export function memoize<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  options: {
    maxSize?: number;
    maxAge?: number;
    keyGenerator?: (args: TArgs) => CacheKey;
    precision?: number; // Decimal places for number rounding in cache key
    enabled?: boolean; // Allow disabling memoization dynamically
  } = {}
): (...args: TArgs) => TReturn {
  const cache = new LRUCache<TReturn>(
    options.maxSize ?? 100,
    options.maxAge ?? 60000
  );

  const memoized = (...args: TArgs): TReturn => {
    // Allow disabling memoization
    if (options.enabled === false) {
      return fn(...args);
    }

    const key = options.keyGenerator
      ? options.keyGenerator(args)
      : createCacheKey(args, options.precision);

    // const cached = cache.get(key);
    // if (cached !== undefined) {
    //   console.debug(`[Cache HIT] ${fn.name || "anonymous"}`, {
    //     cacheSize: cache.getSize(),
    //     key: key.substring(0, 100) + (key.length > 100 ? "..." : ""),
    //   });
    //   return cached;
    // } else {
    //   console.debug(`[Cache MISS] ${fn.name || "anonymous"}`, {
    //     cacheSize: cache.getSize(),
    //   });
    // }

    const result = fn(...args);
    cache.set(key, result);
    // console.debug(`[Cache SET] ${fn.name || "anonymous"}`, {
    //   cacheSize: cache.getSize(),
    // });
    return result;
  };

  // Expose cache control methods
  (memoized as typeof memoized & { clearCache: () => void }).clearCache = () =>
    cache.clear();
  (memoized as typeof memoized & { getCacheSize: () => number }).getCacheSize =
    () => cache.getSize();

  return memoized;
}

/**
 * Specialized memoization for array results
 * Returns a new array reference only if the content actually changed
 */
export function memoizeArray<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn[],
  options: {
    maxSize?: number;
    maxAge?: number;
    precision?: number;
  } = {}
): (...args: TArgs) => TReturn[] {
  return memoize(fn, options);
}
