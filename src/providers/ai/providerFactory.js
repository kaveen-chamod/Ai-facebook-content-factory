// Purpose: Choose the active AI text provider based on environment configuration.

import { GeminiProvider } from "./geminiProvider.js";
import { GroqProvider } from "./groqProvider.js";

export function createAIProvider(provider = process.env.AI_PROVIDER || "gemini") {
  switch (provider) {
    case "gemini":
      return new GeminiProvider();

    case "groq":
      return new GroqProvider();

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
