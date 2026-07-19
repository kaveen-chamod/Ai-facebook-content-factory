// Purpose: Coordinate the complete AI content workflow.
// Generate post -> Generate image -> Design image -> Publish Facebook -> Update database -> Cleanup local disk.

import { generateAndSavePost } from './postService.js';
import { publishPost } from './facebookPublisher.js';
import { supabase } from './supabaseService.js';
import { logSuccess, logFailure, logInfo } from './workflowLogService.js';

import { generateImagePrompt } from '../generators/imagePromptGenerator.js';
import { generateImage } from './imageService.js';
import { uploadImage } from './storageService.js';
import { createDesignedImage } from './imageDesignService.js';

import crypto from 'crypto'; // Used to generate a unified tracking ID for the entire workflow session
import fs from 'fs'; // Used for deleting local temp files
import path from 'path'; // Used for handling absolute paths safely

/**
 * Update a post record with only the supplied fields.
 */
async function updatePost(postId, updates) {
  if (!postId) {
    throw new Error("postId is required to update a post.");
  }

  if (!updates || typeof updates !== "object") {
    throw new Error("updates must be an object with fields to update.");
  }

  console.log("Updating post id:", postId);
  console.log("Update payload:", updates);

  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", postId)
    .select()
    .single();

  console.log("Updated row:", data);
  console.log("Update error:", error);

  if (error) {
    throw new Error(`Database update failed: ${error.message}`);
  }

  return data;
}

/**
 * Safely deletes a local file from the disk if it exists.
 * Does not crash the workflow if the file is already missing.
 */
async function safeDeleteFile(relativeOrAbsolutePath) {
  try {
    if (!relativeOrAbsolutePath) return;

    const absolutePath = path.isAbsolute(relativeOrAbsolutePath)
      ? relativeOrAbsolutePath
      : path.resolve(process.cwd(), relativeOrAbsolutePath);

    await fs.promises.unlink(absolutePath);
    console.log(`[Cleanup] Successfully deleted local temp file: ${relativeOrAbsolutePath}`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`[Cleanup] Warning: Could not delete ${relativeOrAbsolutePath}: ${error.message}`);
    }
  }
}

/**
 * Main AI Facebook Content Workflow
 */
export async function runPostWorkflow() {
  const workflowId = crypto.randomUUID();
  let currentPostId = null;

  let tempBackgroundImagePath = null;
  let tempDesignedImagePath = null;

  try {
    // ==================================================
    // START WORKFLOW LOGGING
    // ==================================================
    await logInfo({ 
      workflow_id: workflowId, 
      step: 'Workflow Started', 
      message: 'Initiating automated content factory sequence.' 
    });

    // ==================================================
    // STEP 1: Generate AI Post Content
    // ==================================================
    const savedPost = await generateAndSavePost();

    if (!savedPost) {
      throw new Error("Post generation failed");
    }

    currentPostId = savedPost.id;
    console.log("Post generated successfully.");
    console.log(savedPost);
    
    await logSuccess({ 
      workflow_id: workflowId, 
      post_id: currentPostId,
      step: 'Generate Content', 
      message: `Content generated and saved successfully. Database Post ID: ${savedPost.id}` 
    });

    // ==================================================
    // STEP 2: Create Image Prompt
    // ==================================================
    const imagePrompt = generateImagePrompt(savedPost);

    console.log("\n===============================");
    console.log("IMAGE PROMPT");
    console.log("===============================");
    console.log(imagePrompt);

    await updatePost(savedPost.id, {
      image_prompt: imagePrompt
    });
    
    await logSuccess({ 
      workflow_id: workflowId, 
      post_id: currentPostId,
      step: 'Create Image Prompt', 
      message: 'Prompt created and updated in database.' 
    });

    // ==================================================
    // STEP 3: Generate Background Image
    // ==================================================
    const imageResult = await generateImage(imagePrompt);

    if (!imageResult.success) {
      throw new Error("Image generation failed");
    }

    tempBackgroundImagePath = imageResult.imagePath;
    console.log("\nBackground Image:");
    console.log(tempBackgroundImagePath);
    
    await logSuccess({ 
      workflow_id: workflowId, 
      post_id: currentPostId,
      step: 'Generate Image', 
      message: 'Background image generated via AI provider.' 
    });

    // ==================================================
    // STEP 4: Create Designed Facebook Image
    // ==================================================
    const designedImage = await createDesignedImage({
      imagePath: imageResult.imagePath,
      title: savedPost.title,
      description: savedPost.caption
    });

    if (!designedImage.success) {
      throw new Error("Image design failed");
    }

    tempDesignedImagePath = designedImage.imagePath;
    console.log("\nDesigned Image:");
    console.log(tempDesignedImagePath);
    
    await logSuccess({ 
      workflow_id: workflowId, 
      post_id: currentPostId,
      step: 'Design Image', 
      message: 'Title and caption overlay layout design completed.' 
    });

    // ==================================================
    // STEP 5: Upload Designed Image to Supabase Storage
    // ==================================================
    const storageResult = await uploadImage(designedImage.imagePath);

    console.log("\nStorage Result:");
    console.log(storageResult);

    if (!storageResult.success) {
      throw new Error("Image storage upload failed");
    }

    await updatePost(savedPost.id, {
      image_url: storageResult.publicUrl
    });
    
    await logSuccess({ 
      workflow_id: workflowId, 
      post_id: currentPostId,
      step: 'Upload Storage', 
      message: `Image uploaded to storage bucket successfully. URL: ${storageResult.publicUrl}` 
    });

    // ==================================================
    // STEP 6: Publish Facebook Post
    // ==================================================
    const publisherInput = {
      title: savedPost.title,
      caption: savedPost.caption,
      hashtags: savedPost.hashtags,
      imageUrl: storageResult.publicUrl,
      imagePath: designedImage.imagePath
    };

    const publisherResult = await publishPost(publisherInput);

    if (!publisherResult.success) {
      throw new Error(publisherResult.message);
    }

    await logSuccess({ 
      workflow_id: workflowId, 
      post_id: currentPostId,
      step: 'Facebook Upload', 
      message: `Content published to Facebook page. Post ID: ${publisherResult.facebookPostId}` 
    });

    // ==================================================
    // STEP 7: Update Database Status
    // ==================================================
    const updatedPost = await updatePost(savedPost.id, {
      status: "published",
      facebook_post_id: publisherResult.facebookPostId
    });

    if (!updatedPost) {
      throw new Error("Post database update failed");
    }
    
    await logSuccess({ 
      workflow_id: workflowId, 
      post_id: currentPostId,
      step: 'Database Update', 
      message: 'Final production metadata updated to published.' 
    });

    // ==================================================
    // COMPLETE & CLEANUP (SUCCESS PATH)
    // ==================================================
    await logSuccess({ 
      workflow_id: workflowId, 
      post_id: currentPostId,
      step: 'Workflow Finished', 
      message: 'All automated content lifecycle phases executed perfectly.' 
    });

    console.log("\n[Cleanup] Cleaning up temporary local images...");
    await safeDeleteFile(tempBackgroundImagePath);
    await safeDeleteFile(tempDesignedImagePath);

    return {
      success: true,
      post: updatedPost,
      image: imageResult,
      designedImage,
      storage: storageResult,
      publisher: publisherResult
    };

  } catch (error) {
    await logFailure({ 
      workflow_id: workflowId, 
      post_id: currentPostId,
      step: 'Workflow Failed', 
      message: error.message 
    });

    console.log("\n[Cleanup] Cleaning up temporary local images after workflow failure...");
    await safeDeleteFile(tempBackgroundImagePath);
    await safeDeleteFile(tempDesignedImagePath);
    
    throw new Error(`Post workflow failed: ${error.message}`);
  }
}