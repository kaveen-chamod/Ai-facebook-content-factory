// Purpose:
// AI Review Agent
// Responsible for reviewing generated Facebook content before publishing.
// This agent evaluates grammar, tone, audience suitability, positivity,
// image relevance, quality, composition, and clickability.

import { createAIProvider } from "../providers/ai/providerFactory.js";

const REVIEW_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    approved: { type: "boolean" },
    score: { type: "number", minimum: 0, maximum: 100 },
    reason: { type: "string" },
    suggestions: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["approved", "score", "reason", "suggestions"],
};

function buildReviewPrompt({ title, caption, hashtags, imagePrompt, imagePath }) {
  return `You are an AI content reviewer for a professional Facebook page targeted at US seniors age 65+.

Review the generated Facebook content and the associated image details.

Title:
${title}

Caption:
${caption}

Hashtags:
${hashtags}

Image prompt:
${imagePrompt}

Image path:
${imagePath}

Evaluate the content for:
1. Grammar
2. Spelling
3. Facebook friendliness
4. Audience suitability (US age 65+)
5. Positivity
6. Emotional engagement
7. Image relevance
8. Image quality
9. Image composition
10. Clickability

Return ONLY valid JSON with the following format:
{
  "approved": true,
  "score": 95,
  "reason": "Excellent post.",
  "suggestions": []
}

If the score is below 80, set approved to false and explain why.
Do not include any additional text outside the JSON object.
`;
}

/**
 * Review generated Facebook content before publishing.
 *
 * @param {object} reviewInput - Content and image metadata to review.
 * @param {string} reviewInput.title
 * @param {string} reviewInput.caption
 * @param {string[]} reviewInput.hashtags
 * @param {string} reviewInput.imagePrompt
 * @param {string} reviewInput.imagePath
 * @returns {Promise<object>} Review result object
 */
export async function reviewContent({ title, caption, hashtags, imagePrompt, imagePath }) {
  const provider = createAIProvider();
  const prompt = buildReviewPrompt({ title, caption, hashtags, imagePrompt, imagePath });

  const responseText = await provider.generateContent(prompt, {
    responseMimeType: "application/json",
    responseSchema: REVIEW_RESPONSE_SCHEMA,
  });

  return JSON.parse(responseText);
}
