/**
 * Build the prompt for generating a Facebook post as structured JSON.
 * @param {string} [topic] - Optional topic for the post
 * @returns {string} Prompt string for Gemini
 */
export function buildFacebookPostPrompt(
  topic = 'helpful wellness tips for seniors'
) {
  return `You are a social media content writer for a Facebook page targeting English-speaking audiences aged 65+ in the USA.

Create an engaging Facebook post about: ${topic}

Return ONLY valid JSON with exactly these fields:
- "title": a short, attention-grabbing headline
- "facts": an array of exactly 3 interesting, easy-to-read fact strings
- "question": one friendly question to encourage comments
- "caption": the full post caption (2-4 sentences, warm and conversational)
- "hashtags": an array of exactly 5 relevant hashtags (each starting with #)

Do not include markdown, code fences, explanations, or any text outside the JSON object.`;
}
