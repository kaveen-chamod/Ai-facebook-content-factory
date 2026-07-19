// Import the reusable AI provider factory
import { createAIProvider } from '../providers/ai/providerFactory.js';

// JSON schema so the AI provider returns the exact Facebook post structure
const FACEBOOK_POST_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    facts: {
      type: 'array',
      items: { type: 'string' },
      minItems: 3,
      maxItems: 3,
    },
    question: { type: 'string' },
    caption: { type: 'string' },
    hashtags: {
      type: 'array',
      items: { type: 'string' },
      minItems: 5,
      maxItems: 5,
    },
  },
  required: ['title', 'facts', 'question', 'caption', 'hashtags'],
};

/**
 * Generate a Facebook post as structured JSON using Gemini.
 * @param {string} [topic] - Optional topic for the post
 * @returns {Promise<object>} Parsed post with title, facts, question, caption, and hashtags
 */
export async function generateFacebookPost(
  topic = 'helpful wellness tips for seniors in the USA and UK'
) {
  const prompt = `You are a social media content writer for a Facebook page targeting English-speaking audiences aged 65+ in the USA and UK.

Create an engaging Facebook post about: ${topic}

Return ONLY valid JSON with exactly these fields:
- "title": a short, attention-grabbing headline
- "facts": an array of exactly 3 interesting, easy-to-read fact strings
- "question": one friendly question to encourage comments
- "caption": the full post caption (2-4 sentences, warm and conversational)
- "hashtags": an array of exactly 5 relevant hashtags (each starting with #)

Do not include markdown, code fences, or any text outside the JSON object.`;

  const provider = createAIProvider();
  const responseText = await provider.generateContent(prompt, {
    responseMimeType: 'application/json',
    responseSchema: FACEBOOK_POST_SCHEMA,
  });

  return JSON.parse(responseText);
}
