// Purpose: Provide a real Google-backed image provider using the official @google/genai SDK.
// This implementation generates an image through the current image generation API and saves it locally.

import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { ImageProvider } from './imageProvider.js';

// Load environment variables so the provider can use GEMINI_API_KEY.
dotenv.config();

// Read the API key from the environment.
const apiKey = process.env.GEMINI_API_KEY;

// Create a singleton Google GenAI client for image requests.
const googleGenAI = new GoogleGenAI({ apiKey });

/**
 * Concrete image provider for Google image generation.
 * It uses the current official SDK image API and writes the result to disk.
 */
export class GoogleImageProvider extends ImageProvider {
  /**
   * Generate an image from a text prompt and save it to the output folder.
   * @param {string} prompt - The detailed image-generation prompt.
   * @returns {Promise<{success: boolean, imagePath?: string, message?: string}>} The generation result.
   */
  async generateImage(prompt) {
    try {
      // Validate the prompt before sending it to the API.
      if (typeof prompt !== 'string' || prompt.trim().length === 0) {
        return {
          success: false,
          message: 'A non-empty prompt string is required.',
        };
      }

      // Request one image using the current official SDK image generation method.
      const response = await googleGenAI.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
          numberOfImages: 1,
        },
      });

      // Extract the generated image bytes from the response.
      const imageBytes = response?.generatedImages?.[0]?.image?.imageBytes;

      if (!imageBytes) {
        return {
          success: false,
          message: 'Google image generation returned no image payload.',
        };
      }

      // Ensure the output directory exists before writing the file.
      const outputDir = path.resolve(process.cwd(), 'output');
      await fs.mkdir(outputDir, { recursive: true });

      // Save the generated image to the requested path.
      const outputPath = path.join(outputDir, 'background.png');
      const imageBuffer = Buffer.from(imageBytes, 'base64');
      await fs.writeFile(outputPath, imageBuffer);

      return {
        success: true,
        imagePath: outputPath,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Google image generation failed.',
      };
    }
  }
}
