// Purpose: Coordinate the complete AI content workflow.
// Generate post -> Save Supabase -> Publish Facebook -> Update database.

import { generateAndSavePost } from './postService.js';
import { publishPost } from './facebookPublisher.js';
import { supabase } from './supabaseService.js';


/**
 * Update the database after successful Facebook publishing.
 */
async function updatePublishedPost(postId, facebookPostId) {

  const { data, error } = await supabase
    .from('posts')
    .update({
      status: 'published',
      facebook_post_id: facebookPostId,
    })
    .eq('id', postId)
    .select()
    .single();


  if (error) {

    throw new Error(
      `Failed to update published post: ${error.message}`
    );

  }


  return data;

}



/**
 * Run complete post workflow:
 *
 * 1. Generate content with Gemini
 * 2. Save post to Supabase
 * 3. Publish to Facebook
 * 4. Update Supabase with Facebook ID
 */
export async function runPostWorkflow() {

  try {


    // Step 1:
    // Generate AI post and save database row
    const savedPost = await generateAndSavePost();


    if (!savedPost) {

      throw new Error(
        'Post generation returned no result.'
      );

    }



    // Step 2:
    // Prepare Facebook payload
    const publisherInput = {

      title: savedPost.title,

      caption: savedPost.caption,

      hashtags: savedPost.hashtags,

    };



    // Step 3:
    // Publish to Facebook
    const publisherResult = await publishPost(
      publisherInput
    );



    if (!publisherResult.success) {

      throw new Error(
        publisherResult.message
      );

    }



    // Step 4:
    // Update Supabase row
    const updatedPost = await updatePublishedPost(
      savedPost.id,
      publisherResult.facebookPostId
    );



    return {

      success:true,

      post:updatedPost,

      publisher:publisherResult

    };


  } catch(error) {


    throw new Error(
      `Post workflow failed: ${error.message}`
    );


  }

}