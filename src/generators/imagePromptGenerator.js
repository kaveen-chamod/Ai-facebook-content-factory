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
  const hashtags = Array.isArray(post.hashtags)
    ? post.hashtags.join(' ')
    : String(post.hashtags || '');

  // Build a concise topic summary from the available content.
  const topicSummary = [title, facts, caption, question,]
    .filter(Boolean)
    .join(' ')
    .trim();

  // Create a structured prompt that is suitable for a high-quality background image.
  return [
    'Scene:',
    `Create a photorealistic Facebook background image that visually represents the topic: ${topicSummary}.`,
    'People:',
    'Show a warm, natural, and relatable scene with one or two people, preferably older adults in a realistic everyday setting, with calm and positive facial expressions. Avoid exaggerated poses or staged emotion.',
    'Environment:',
    'Use a clean, welcoming, and authentic environment that feels appropriate for an American audience aged 65+. The setting should feel comfortable, friendly, and believable, such as a home, community space, park, small-town street, or family gathering scene.',
    'Lighting:',
    'Use warm natural lighting with soft daylight or gentle indoor illumination. The mood should feel bright, inviting, and realistic.',
    'Camera:',
    'Use a high-quality photography style with a wide 16:9 composition, clean framing, and balanced visual hierarchy. Keep the composition elegant and suitable for a Facebook cover or background image.',
    'Style:',
    'Photorealistic, high detail, cinematic but natural, crisp focus, realistic textures, and professional composition. The image should feel polished and emotionally warm.',
    'Restrictions:',
    'Do not include any text inside the image. Do not include logos, watermarks, brand marks, or visible signage. Avoid violence, politics, religion, disturbing content, and anything that would feel inappropriate for older adults. Keep the scene safe, positive, and emotionally comfortable.'
  ].join('\n');
}
