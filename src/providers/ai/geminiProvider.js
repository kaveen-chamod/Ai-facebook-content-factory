// Purpose: Gemini provider implementation for AI text generation.

import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { AIProvider } from "./aiProvider.js";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [2000, 4000, 8000];
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

const ai = new GoogleGenAI({ apiKey });

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

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
    if (typeof candidate === "number") {
      return candidate;
    }

    if (typeof candidate === "string" && /^\d{3}$/.test(candidate)) {
      return Number(candidate);
    }
  }

  const message = error?.message || "";
  const match = message.match(/\b(429|500|502|503|504)\b/);

  return match ? Number(match[1]) : null;
}

function isRetryableError(statusCode) {
  return statusCode !== null && RETRYABLE_STATUS_CODES.has(statusCode);
}

export class GeminiProvider extends AIProvider {
  async generateContent(prompt, config = {}) {
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Prompt is required for Gemini content generation.");
    }

    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt += 1) {
      try {
        const response = await ai.models.generateContent({
          model: DEFAULT_MODEL,
          contents: prompt,
          ...config,
        });

        return response.text;
      } catch (error) {
        const statusCode = getErrorStatus(error);
        const shouldRetry = isRetryableError(statusCode) && attempt <= MAX_RETRIES;

        if (shouldRetry) {
          const delayMs = RETRY_DELAYS_MS[attempt - 1];
          const reason = statusCode ? `HTTP ${statusCode}` : "transient API error";

          console.warn(
            `Gemini attempt ${attempt} failed with ${reason}. Retrying in ${delayMs / 1000}s...`
          );

          await sleep(delayMs);
          continue;
        }

        throw error;
      }
    }

    throw new Error("Gemini failed to generate content after retries.");
  }
}
