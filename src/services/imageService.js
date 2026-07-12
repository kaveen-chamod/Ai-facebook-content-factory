// Purpose: Generate images using the configured provider.

import { createImageProvider } from "../providers/image/providerFactory.js";

/**
 * Generate an image using the configured provider.
 *
 * @param {string} prompt
 * @returns {Promise<{success:boolean,imagePath:string}>}
 */
export async function generateImage(prompt) {

    if (!prompt || typeof prompt !== "string") {
        throw new Error("Prompt is required.");
    }

    try {

        // Create provider (Google / Pollinations)
        const provider = createImageProvider();
        console.log("Using provider:", provider.constructor.name);

        // Generate image
        const result = await provider.generateImage(prompt);

        // Provider returned an error
        if (!result.success) {
            throw new Error(result.message);
        }

        return {
            success: true,
            imagePath: result.imagePath,
        };

    }catch (error) {

    console.error("IMAGE ERROR:");
    console.error(error);

    throw new Error(
        `Image generation failed: ${error.message || JSON.stringify(error)}`
    );

}

}