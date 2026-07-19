// Purpose: Define the base AI provider interface for text generation.

export class AIProvider {
  /**
   * Generate text content from a prompt.
   * @param {string} prompt - The prompt to send to the AI provider
   * @param {object} [config] - Optional provider-specific generation config
   * @returns {Promise<string>} Generated text content
   */
  async generateContent(prompt, config = {}) {
    throw new Error("generateContent() must be implemented by subclasses.");
  }
}
