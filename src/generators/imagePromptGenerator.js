// Purpose: Build a single, detailed image prompt for an AI image generator from a Facebook post payload.
// This module only constructs the prompt and does not call Gemini or generate any images.

/**
 * Create one rich prompt string for an AI image generator based on a Facebook post payload.
 * @param {{title?: string, facts?: string[]|string, caption?: string, question?: string, hashtags?: string[]|string}} post - The post data used to infer the scene.
 * @returns {string} A detailed image prompt with clearly separated sections.
 */
export function generateImagePrompt(post = {}) {
  // Extract the most relevant text from the incoming post data.
  const title = post.title || 'Community story';
  const facts = Array.isArray(post.facts)
    ? post.facts.join(' ')
    : String(post.facts || '');
  const caption = post.caption || '';
  const question = post.question || '';
//   const hashtags = Array.isArray(post.hashtags)
//     ? post.hashtags.join(' ')
//     : String(post.hashtags || '');

  // Build a concise topic summary from the available content.
  const topicSummary = [title, facts, caption, question,]
    .filter(Boolean)
    .join(' ')
    .trim();

  // Create a structured prompt that is suitable for a high-quality background image.
  return `
Create a highly realistic Facebook post image.

Topic:
${topicSummary}

Requirements:

• Photorealistic
• American seniors (65+)
• Natural smiles
• Warm emotions
• Authentic lifestyle
• High-quality DSLR photography
• Soft natural sunlight
• Cinematic composition
• Ultra realistic skin
• Professional color grading
• 16:9 aspect ratio
• Facebook friendly
• No text
• No logos
• No watermark
• No blur
• No cartoon
• No illustration
• No AI artifacts
• No deformed hands
• No extra fingers
• No distorted face
• Extremely detailed
• Sharp focus
• Positive atmosphere
`;
}
