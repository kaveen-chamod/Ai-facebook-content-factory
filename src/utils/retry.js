// Purpose: Reusable retry utility for async operations.

/**
 * Retry an asynchronous function with a delay between attempts.
 *
 * @param {Function} fn - Async function to run.
 * @param {number} [maxRetries=3] - Maximum number of retry attempts.
 * @param {number} [delay=3000] - Delay between retries in milliseconds.
 * @returns {Promise<*>} Result of the successful fn execution.
 */
export async function retryAsync(fn, maxRetries = 3, baseDelay = 30000) {
  // baseDelay is the initial wait time between retries in milliseconds (default 30s)
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      console.log(`Attempt ${attempt}`);
      return await fn();
    } catch (error) {
      lastError = error;

      // Determine HTTP status if present (axios, fetch wrappers, etc.)
      const status = error && (error.response && error.response.status ? error.response.status : error.status ? error.status : null);

      if (status === 429) {
        console.warn('Rate limit hit (429). Pausing before retry...');
      }

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: baseDelay * 2^(attempt-1)
      const delayMs = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retrying after ${delayMs / 1000}s... (attempt ${attempt + 1} of ${maxRetries})`);

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
