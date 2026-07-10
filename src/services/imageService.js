// Purpose: Generate a photorealistic image from a text prompt using the Gemini SDK.
// This module is intentionally reusable and does not connect to the rest of the app automatically.

import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables so the Gemini client can use the configured API key.
dotenv.config();

// Read the Gemini API key from the environment.
const apiKey = process.env.GEMINI_API_KEY;

// Create a single shared Gemini client for image generation requests.
if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY in environment variables.');
}

const ai = new GoogleGenAI({ apiKey });

// The image-focused Gemini model used for photorealistic generation.
const IMAGE_MODEL = 'gemini-2.0-flash-exp-image-generation';

// The output file that will store the generated background image.
const OUTPUT_FILE = 'background.png';

/**
 * Extract the first generated image payload from a Gemini response.
 * @param {object} response - The raw response returned by the Gemini SDK.
 * @returns {Buffer|null} The decoded image data, or null if no image was returned.
 */
function extractImageBuffer(response) {
  const parts = response?.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part?.inlineData?.data) {
      return Buffer.from(part.inlineData.data, 'base64');
    }
  }

  return null;
}

/**
 * Generate one photorealistic background image from a text prompt and save it to disk.
 * @param {string} prompt - The detailed image-generation prompt.
 * @returns {Promise<{success: boolean, imagePath: string}>} The save result with the output path.
 */
export async function generateImage(prompt) {
  // Validate the prompt first so the service fails fast for empty or invalid input.
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('A non-empty prompt string is required.');
  }

  try {
    // Build a generation request that asks for one photorealistic image.
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        temperature: 0.4,
      },
    });

    // Extract the generated image bytes from the response.
    const imageBuffer = extractImageBuffer(response);

    if (!imageBuffer) {
      throw new Error('Gemini did not return an image payload.');
    }

    // Create the output directory automatically so image generation can succeed reliably.
    const outputDir = path.resolve(process.cwd(), 'output');
    await fs.mkdir(outputDir, { recursive: true });

    // Save the image to the requested background file path.
    const outputPath = path.join(outputDir, OUTPUT_FILE);
    await fs.writeFile(outputPath, imageBuffer);

    return {
      success: true,
      imagePath: outputPath,
    };
  } catch (error) {
    throw new Error(`Image generation failed: ${error.message}`);
  }
}
