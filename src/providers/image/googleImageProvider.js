// Purpose: Provide a Google-backed image provider placeholder for the new architecture.
// This file establishes the provider contract without calling any external API yet.

import { ImageProvider } from './imageProvider.js';

/**
 * Concrete image provider placeholder for Google-based image generation.
 * It currently returns a structured not-implemented response.
 */
export class GoogleImageProvider extends ImageProvider {
  /**
   * Generate an image from a text prompt.
   * This implementation is intentionally stubbed and does not call the Google API yet.
   * @param {string} prompt - The detailed image-generation prompt.
   * @returns {Promise<{success: boolean, message: string}>} A not-implemented response.
   */
  async generateImage(prompt) {
    return {
      success: false,
      message: 'Google image provider not implemented yet.',
    };
  }
}
