export interface RateLimiterOptions {
  maxConcurrent: number;
  delayBetweenRequestsMs: number;
}

export class ConcurrencyLimiter {
  private maxConcurrent: number;
  private delayMs: number;
  private running = 0;
  private queue: Array<() => void> = [];
  private inFlightMap = new Map<string, Promise<any>>();

  constructor(options: Partial<RateLimiterOptions> = {}) {
    this.maxConcurrent = options.maxConcurrent || 6;
    this.delayMs = options.delayBetweenRequestsMs || 30;
  }

  async run<T>(task: () => Promise<T>): Promise<T> {
    while (this.running >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }

    this.running++;
    try {
      if (this.delayMs > 0) {
        await new Promise((r) => setTimeout(r, this.delayMs));
      }
      return await task();
    } finally {
      this.running--;
      const next = this.queue.shift();
      if (next) next();
    }
  }

  /**
   * Deduplicates identical in-flight requests
   */
  async deduplicate<T>(dedupKey: string, task: () => Promise<T>): Promise<T> {
    const existing = this.inFlightMap.get(dedupKey);
    if (existing) {
      return existing;
    }

    const promise = this.run(task).finally(() => {
      this.inFlightMap.delete(dedupKey);
    });

    this.inFlightMap.set(dedupKey, promise);
    return promise;
  }
}

/**
 * Execute a task with exponential backoff retry
 */
export async function retryWithBackoff<T>(
  task: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    factor?: number;
    shouldRetry?: (error: any) => boolean;
    onRetry?: (error: any, attempt: number, delayMs: number) => void;
  } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 2;
  let delay = options.initialDelayMs ?? 400;
  const factor = options.factor ?? 2;

  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await task();
    } catch (err: any) {
      lastError = err;
      if (attempt === maxRetries) break;

      if (options.shouldRetry && !options.shouldRetry(err)) {
        break;
      }

      // Add small jitter (±15%)
      const jitter = delay * (0.85 + Math.random() * 0.3);
      if (options.onRetry) {
        options.onRetry(err, attempt + 1, Math.round(jitter));
      }
      await new Promise((r) => setTimeout(r, jitter));
      delay *= factor;
    }
  }

  throw lastError;
}

export const marketRateLimiter = new ConcurrencyLimiter({
  maxConcurrent: 6,
  delayBetweenRequestsMs: 25,
});
