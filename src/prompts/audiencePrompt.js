// Purpose: Describes the target Facebook audience so Gemini can tailor content
// to the right people. Use this prompt alongside the system prompt to keep
// posts relevant, readable, and engaging for older adults in the United States.

/**
 * Build the audience prompt that defines who the content is written for.
 * @returns {string} Audience prompt string for Gemini
 */
export function buildAudiencePrompt() {
  return `Write content for this target audience:

- Country: United States
- Age: 65+
- Language: Simple American English
- Reading level: Easy to understand
- Interests: American history, nostalgia, interesting facts, health, space, classic TV, nature, inspirational stories
- Tone: Warm, respectful, trustworthy, positive

Avoid slang and complicated vocabulary.`;
}
