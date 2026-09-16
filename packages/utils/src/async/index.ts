export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function withTimeout<T>(promise: Promise<T>, ms: number, message = "Operation timed out"): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

interface RetryOptions {
  attempts?: number;
  delayMs?: number;
  backoff?: "fixed" | "exponential";
  onRetry?: (error: unknown, attempt: number) => void;
}

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { attempts = 3, delayMs = 300, backoff = "exponential", onRetry } = options;

  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      onRetry?.(err, i + 1);
      if (i < attempts - 1) {
        const wait = backoff === "exponential" ? delayMs * 2 ** i : delayMs;
        await sleep(wait);
      }
    }
  }
  throw lastError;
}

/** run promises with a max concurrency limit */
export async function promisePool<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function runNext(): Promise<void> {
    const current = cursor++;
    if (current >= items.length) return;
    results[current] = await worker(items[current], current);
    return runNext();
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runNext));
  return results;
}

/** wraps a promise so you get [error, data] instead of try/catch */
export async function to<T>(promise: Promise<T>): Promise<[null, T] | [unknown, undefined]> {
  try {
    const data = await promise;
    return [null, data];
  } catch (err) {
    return [err, undefined];
  }
}

export function isPromise(value: unknown): value is Promise<unknown> {
  return !!value && typeof (value as Promise<unknown>).then === "function";
}