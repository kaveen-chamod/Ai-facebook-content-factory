// Import the Google Gen AI SDK
import { GoogleGenAI } from '@google/genai';

// Import dotenv to load environment variables from .env
import dotenv from 'dotenv';

// Load .env into process.env (includes GEMINI_API_KEY)
dotenv.config();

// Read the API key from the environment
const apiKey = process.env.GEMINI_API_KEY;

// Initialize a single shared Gemini client
const ai = new GoogleGenAI({ apiKey });

// Gemini model selection
// The model id is configurable via the GEMINI_MODEL environment variable.
// If GEMINI_MODEL is not set, default to a safe baseline model optimized
// for text generation. Changing the environment variable allows runtime
// selection of different Gemini models without modifying source code.
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

// Retry transient API failures up to three times.
const MAX_RETRIES = 3;

// Retry delays for attempts 1, 2, and 3.
const RETRY_DELAYS_MS = [2000, 4000, 8000];

// Retryable HTTP status codes for temporary upstream issues.
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

/**
 * Pause execution for a short period before retrying a transient request.
 * @param {number} milliseconds - Time to wait before continuing
 * @returns {Promise<void>} Promise that resolves after the delay
 */
function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Extract a numeric HTTP status from a thrown Gemini error when possible.
 * @param {unknown} error - The error thrown by the SDK
 * @returns {number|null} Numeric status code if one can be detected
 */
function getErrorStatus(error) {
  if (!error) {
    return null;
  }

  const candidates = [
    error?.status,
    error?.code,
    error?.statusCode,
    error?.response?.status,
    error?.details?.[0]?.status,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'number') {
      return candidate;
    }

    if (typeof candidate === 'string' && /^\d{3}$/.test(candidate)) {
      return Number(candidate);
    }
  }

  const message = error?.message || '';
  const match = message.match(/\b(429|500|502|503|504)\b/);

  return match ? Number(match[1]) : null;
}

/**
 * Determine whether a failure should be retried.
 * @param {number|null} statusCode - Detected HTTP status code
 * @returns {boolean} True when the error is transient and retryable
 */
function isRetryableError(statusCode) {
  return statusCode !== null && RETRYABLE_STATUS_CODES.has(statusCode);
}

/**
 * Send a prompt to Gemini and return the response text.
 * Retry transient API failures with exponential backoff.
 * @param {string} prompt - The prompt to send to the model
 * @param {object} [config] - Optional generation config (e.g. responseMimeType, responseSchema)
 * @returns {Promise<string>} The model's text response
 */
export async function generateContent(prompt, config = {}) {
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config,
      });

      return response.text;
    } catch (error) {
      const statusCode = getErrorStatus(error);
      const shouldRetry = isRetryableError(statusCode) && attempt <= MAX_RETRIES;

      if (shouldRetry) {
        const delayMs = RETRY_DELAYS_MS[attempt - 1];
        const reason = statusCode ? `HTTP ${statusCode}` : 'transient API error';

        console.warn(
          `Gemini attempt ${attempt} failed with ${reason}. Retrying in ${delayMs / 1000}s...`
        );

        await sleep(delayMs);
        continue;
      }

      throw error;
    }
  }
}
