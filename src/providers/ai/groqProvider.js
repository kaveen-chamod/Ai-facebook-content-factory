// Purpose: Groq provider implementation for AI text generation.

import dotenv from "dotenv";
import Groq from "groq-sdk";
import { AIProvider } from "./aiProvider.js";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.3-70b-versatile";

export class GroqProvider extends AIProvider {
  async generateContent(prompt, config = {}) {
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Prompt is required for Groq content generation.");
    }

    try {
      const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        ...config,
      });

      return response.choices[0].message.content;
    } catch (error) {
      throw new Error(`Groq generation failed: ${error.message}`);
    }
  }
}
