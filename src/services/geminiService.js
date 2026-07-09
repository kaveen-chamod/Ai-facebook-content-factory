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

// Default model for text generation
const DEFAULT_MODEL = 'gemini-2.5-flash';

/**
 * Send a prompt to Gemini and return the response text.
 * @param {string} prompt - The prompt to send to the model
 * @param {object} [config] - Optional generation config (e.g. responseMimeType, responseSchema)
 * @returns {Promise<string>} The model's text response
 */
export async function generateContent(prompt, config = {}) {
  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config,
  });

  return response.text;
}
