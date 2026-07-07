// Simple in-memory TTL cache. Shared across requests in a warm serverless
// instance / dev server. Stretches free-tier limits: all users share cached data.
type Entry = { value: unknown; expires: number };
const store = new Map<string, Entry>();

export async function cached<T>(key: string, ttlSec: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  try {
    const value = await fn();
    store.set(key, { value, expires: Date.now() + ttlSec * 1000 });
    return value;
  } catch (e) {
    // Serve stale data on upstream failure rather than erroring the UI.
    if (hit) return hit.value as T;
    throw e;
  }
}

