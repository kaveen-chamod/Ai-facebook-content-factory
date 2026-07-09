import { buildSystemPrompt } from './systemPrompt.js';
import { buildAudiencePrompt } from './audiencePrompt.js';
import { getRandomTopic } from './topics.js';

/**
 * Build a combined prompt for Gemini to generate a Facebook post as structured JSON.
 * @returns {string} Final prompt string for Gemini
 */
export function buildFacebookPostPrompt() {
  // Get the core system instructions for the model.
  const systemPrompt = buildSystemPrompt();

  // Get the audience-specific writing instructions.
  const audiencePrompt = buildAudiencePrompt();

  // Pick one fresh topic for the post.
  const topic = getRandomTopic();

  // Combine all instructions into one final prompt.
  return `${systemPrompt}

${audiencePrompt}

Create one engaging Facebook post about this topic: ${topic}

Return ONLY valid JSON.
The JSON object must include these fields:
- title: a short, attention-grabbing headline
- facts: an array of exactly 3 interesting fact strings
- question: one friendly question to encourage comments
- caption: a warm and conversational Facebook caption
- hashtags: an array of exactly 5 relevant hashtags

Never return markdown.
Never return explanations.
Do not include any text outside the JSON object.`;
}
