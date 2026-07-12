// Purpose: Coordinate the complete AI content workflow.
// Generate post -> Generate image -> Save image -> Publish Facebook -> Update database.

import { generateAndSavePost } from './postService.js';
import { publishPost } from './facebookPublisher.js';
import { supabase } from './supabaseService.js';

import { generateImagePrompt } from '../generators/imagePromptGenerator.js';
import { generateImage } from './imageService.js';


/**
 * Update the database after successful Facebook publishing.
 */
async function updatePublishedPost(postId, facebookPostId) {

  console.log("Updating post id:", postId);
  console.log("Facebook id:", facebookPostId);

  const { data, error } = await supabase
    .from("posts")
    .update({
      status: "published",
      facebook_post_id: facebookPostId,
    })
    .eq("id", postId)
    .select()
    .single();

  console.log("Updated row:", data);
  console.log("Update error:", error);

  if (error) {
    throw new Error(
      `Failed to update published post: ${error.message}`
    );
  }

  return data;
}


/**
 * Complete workflow
 */
export async function runPostWorkflow() {

  try {

    // ==================================================
    // STEP 1
    // Generate AI Post
    // ==================================================

    const savedPost = await generateAndSavePost();

    if (!savedPost) {
      throw new Error("Post generation returned no result.");
    }

    console.log("Post generated successfully.");
    console.log(savedPost);


    // ==================================================
    // STEP 2
    // Generate Image Prompt
    // ==================================================

    const imagePrompt = generateImagePrompt(savedPost);

    console.log("\n===============================");
    console.log("IMAGE PROMPT");
    console.log("===============================");
    console.log(imagePrompt);


    // ==================================================
    // STEP 3
    // Generate Image
    // ==================================================

    const imageResult = await generateImage(imagePrompt);

    if (!imageResult.success) {
      throw new Error("Image generation failed.");
    }

    console.log("\nImage Generated:");
    console.log(imageResult.imagePath);


    // ==================================================
    // STEP 4
    // Publish Facebook
    // ==================================================

    const publisherInput = {

      title: savedPost.title,

      caption: savedPost.caption,

      hashtags: savedPost.hashtags,

      imagePath: imageResult.imagePath

    };

    const publisherResult = await publishPost(
      publisherInput
    );

    if (!publisherResult.success) {
      throw new Error(
        publisherResult.message
      );
    }


    // ==================================================
    // STEP 5
    // Update Database
    // ==================================================

    const updatedPost = await updatePublishedPost(
      savedPost.id,
      publisherResult.facebookPostId
    );

    if (!updatedPost) {
      throw new Error("Database update failed.");
    }


    // ==================================================
    // DONE
    // ==================================================

    return {

      success: true,

      post: updatedPost,

      image: imageResult,

      publisher: publisherResult,

    };

  }

  catch (error) {

    throw new Error(
      `Post workflow failed: ${error.message}`
    );

  }

}