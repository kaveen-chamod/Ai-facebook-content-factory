// Purpose: Define the shared interface for all image providers in the architecture.
// This abstraction keeps image generation logic modular and provider-agnostic.

/**
 * Abstract base class for image providers.
 * Each provider must implement the generateImage method.
 */
export class ImageProvider {
  /**
   * Generate an image from a text prompt.
   * @param {string} prompt - The detailed image-generation prompt.
   * @returns {Promise<{success: boolean, message?: string, imagePath?: string}>} The provider result.
   */
  async generateImage(prompt) {
    throw new Error('Not implemented');
  }
}
