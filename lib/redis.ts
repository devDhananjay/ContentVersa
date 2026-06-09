// Redis caching layer with in-memory fallback when REDIS_URL is unavailable.
// Use `cache.get`, `cache.set`, `cache.del`, and `cache.wrap` for fetch+cache patterns.

import type Redis from "ioredis";

type CacheValue = string | number | object | boolean | null;

interface CacheDriver {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: CacheValue, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

class MemoryDriver implements CacheDriver {
  private store = new Map<string, { v: unknown; exp: number | null }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.exp && item.exp < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return item.v as T;
  }
  async set(key: string, value: CacheValue, ttlSeconds?: number) {
    this.store.set(key, {
      v: value,
      exp: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }
  async del(key: string) {
    this.store.delete(key);
  }
}

class RedisDriver implements CacheDriver {
  constructor(private client: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }
  async set(key: string, value: CacheValue, ttlSeconds?: number) {
    const v = typeof value === "string" ? value : JSON.stringify(value);
    if (ttlSeconds) await this.client.set(key, v, "EX", ttlSeconds);
    else await this.client.set(key, v);
  }
  async del(key: string) {
    await this.client.del(key);
  }
}

let driver: CacheDriver | null = null;
const inflight = new Map<string, Promise<unknown>>();

async function getDriver(): Promise<CacheDriver> {
  if (driver) return driver;
  if (process.env.REDIS_URL) {
    try {
      const { default: IORedis } = await import("ioredis");
      const client = new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
      });
      await client.connect();
      driver = new RedisDriver(client);
      return driver;
    } catch (err) {
      console.warn("[cache] Redis unavailable, falling back to memory:", err);
    }
  }
  driver = new MemoryDriver();
  return driver;
}

export const cache = {
  async get<T = unknown>(key: string) {
    return (await getDriver()).get<T>(key);
  },
  async set(key: string, value: CacheValue, ttlSeconds?: number) {
    return (await getDriver()).set(key, value, ttlSeconds);
  },
  async del(key: string) {
    return (await getDriver()).del(key);
  },
  async wrap<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
    const hit = await this.get<T>(key);
    if (hit !== null && hit !== undefined) return hit;

    const pending = inflight.get(key);
    if (pending) return pending as Promise<T>;

    const promise = (async () => {
      try {
        const value = await loader();
        await this.set(key, value as CacheValue, ttlSeconds);
        return value;
      } finally {
        inflight.delete(key);
      }
    })();

    inflight.set(key, promise);
    return promise;
  },
};
