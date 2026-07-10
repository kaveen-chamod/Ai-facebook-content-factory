// Purpose: Generate a Facebook post with Gemini and persist it to Supabase.
// This service keeps the generation and storage steps separated while following the project's modular architecture.

import { buildFacebookPostPrompt } from '../prompts/facebookPostPrompt.js';
import { generateContent } from './geminiService.js';
import { supabase } from './supabaseService.js';

/**
 * Extract a JSON object from Gemini output, even if it is wrapped in markdown code fences.
 * @param {string} responseText - Raw text returned by Gemini.
 * @returns {object} Parsed JSON object.
 */
function parseGeneratedJson(responseText) {
  const trimmedText = responseText.trim();

  // Remove optional markdown code fences before parsing.
  const codeFenceMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidateText = codeFenceMatch ? codeFenceMatch[1].trim() : trimmedText;

  try {
    return JSON.parse(candidateText);
  } catch (error) {
    throw new Error(`Failed to parse Gemini JSON response: ${error.message}`);
  }
}

/**
 * Convert array values into strings so they are suitable for database storage.
 * @param {unknown} value - The value to normalize.
 * @returns {string} A string-safe value for database insertion.
 */
function normalizeForStorage(value) {
  if (Array.isArray(value)) {
    return value.join(' | ');
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

/**
 * Generate one Facebook post with Gemini, validate its structure, and save it to Supabase.
 * @returns {Promise<object>} The inserted post row from the database.
 */
export async function generateAndSavePost() {
  try {
    // Build the prompt for Gemini using the existing prompt architecture.
    const prompt = buildFacebookPostPrompt();

    // Request one structured Facebook post from Gemini.
    const responseText = await generateContent(prompt);

    // Parse the model output into a JSON object.
    const generatedPost = parseGeneratedJson(responseText);

    // Validate that the required fields are present.
    const requiredFields = ['title', 'facts', 'caption', 'question', 'hashtags'];
    const missingFields = requiredFields.filter((field) => !(field in generatedPost));

    if (missingFields.length > 0) {
      throw new Error(`Generated post is missing required fields: ${missingFields.join(', ')}`);
    }

    // Normalize array-based values for database compatibility.
    const payload = {
      title: normalizeForStorage(generatedPost.title).trim(),
      facts: normalizeForStorage(generatedPost.facts).trim(),
      caption: normalizeForStorage(generatedPost.caption).trim(),
      question: normalizeForStorage(generatedPost.question).trim(),
      hashtags: normalizeForStorage(generatedPost.hashtags).trim(),
      status: 'generated',
      page_id: 1,
    };

    // Insert the normalized post into the posts table.
    const { data, error } = await supabase
      .from('posts')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert post into Supabase: ${error.message}`);
    }

    return data;
  } catch (error) {
    throw new Error(`Post generation and save failed: ${error.message}`);
  }
}
