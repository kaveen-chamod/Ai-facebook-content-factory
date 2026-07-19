// Purpose:
// Generate one Facebook post through the AI Content Agent
// and save it to Supabase.

import { generateContent } from "../agents/contentAgent.js";
import { supabase } from "./supabaseService.js";

/**
 * Convert arrays into database-friendly strings.
 */
function normalizeForStorage(value) {

    if (Array.isArray(value)) {
        return value.join(" | ");
    }

    if (value === null || value === undefined) {
        return "";
    }

    return String(value);

}

/**
 * Generate one post and save it.
 */
export async function generateAndSavePost() {

    try {

        // Ask the AI Agent to generate content
        const generatedPost = await generateContent();

        if (!generatedPost) {
            throw new Error("Content Agent returned no data.");
        }

        // Validate required fields
        const requiredFields = [

            "title",
            "facts",
            "caption",
            "question",
            "hashtags"

        ];

        const missing = requiredFields.filter(

            field => !(field in generatedPost)

        );

        if (missing.length > 0) {

            throw new Error(

                `Missing fields: ${missing.join(", ")}`

            );

        }

        // Convert arrays to strings
        const payload = {

            page_id: 1,

            title: normalizeForStorage(
                generatedPost.title
            ).trim(),

            facts: normalizeForStorage(
                generatedPost.facts
            ).trim(),

            caption: normalizeForStorage(
                generatedPost.caption
            ).trim(),

            question: normalizeForStorage(
                generatedPost.question
            ).trim(),

            hashtags: normalizeForStorage(
                generatedPost.hashtags
            ).trim(),

            status: "generated"

        };

        // Save to Supabase
        const { data, error } = await supabase

            .from("posts")

            .insert(payload)

            .select()

            .single();

        if (error) {

            throw new Error(

                `Supabase Error: ${error.message}`

            );

        }

        return data;

    }

    catch (error) {

        throw new Error(

            `Post generation failed: ${error.message}`

        );

    }

}