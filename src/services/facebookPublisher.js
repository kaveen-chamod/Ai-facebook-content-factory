// Purpose: Publish generated posts (with image) to a Facebook Page using Meta Graph API.

import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

/**
 * Normalize hashtags so the final caption is clean and Facebook-friendly.
 */
function normalizeHashtags(rawHashtags) {
  if (!rawHashtags) return [];

  let parts = [];

  if (Array.isArray(rawHashtags)) {
    parts = rawHashtags.map(tag => String(tag).trim()).filter(Boolean);
  } else if (typeof rawHashtags === "string") {
    parts = rawHashtags
      .split(/[\s,|]+/)
      .map(tag => tag.trim())
      .filter(Boolean);
  } else {
    throw new Error("hashtags must be an array or string");
  }

  return parts
    .map(tag => {
      const clean = tag.replace(/^#+/, "").replace(/\s+/g, "");
      return clean ? `#${clean}` : "";
    })
    .filter(Boolean);
}

/**
 * Build the final Facebook message.
 */
function buildFacebookMessage(caption, hashtags) {
  const captionText = caption ? String(caption).trim() : "";
  const hashtagsText = hashtags.length
    ? `\n\n${hashtags.join(" ")}`
    : "";

  return `${captionText}${hashtagsText}`.trim();
}

/**
 * Publish post to Facebook.
 */
export async function publishPost(post) {

  if (!post || typeof post !== "object") {
    throw new Error("Invalid post object");
  }

  const {
    title,
    caption,
    hashtags,
    imagePath
  } = post;

  if (!title?.trim()) {
    throw new Error("Title is required.");
  }

  if (!caption?.trim()) {
    throw new Error("Caption is required.");
  }

  if (!PAGE_ID || !ACCESS_TOKEN) {
    throw new Error(
      "Missing FACEBOOK_PAGE_ID or FACEBOOK_ACCESS_TOKEN."
    );
  }

  try {

    const tagsArray = normalizeHashtags(hashtags);
    const message = buildFacebookMessage(caption, tagsArray);

    let response;

    // -------------------------------------------------
    // IMAGE POST
    // -------------------------------------------------
    if (imagePath) {

      console.log("================================");
      console.log("Uploading IMAGE to Facebook...");
      console.log("Page:", PAGE_ID);
      console.log("Image:", imagePath);
      console.log("================================");

      // Read image
      const imageBuffer = await fs.readFile(imagePath);

      // Convert to Blob
      const imageBlob = new Blob(
        [imageBuffer],
        {
          type: "image/png"
        }
      );

      // Native FormData
      const form = new FormData();

      form.append(
        "source",
        imageBlob,
        "image.png"
      );

      form.append(
        "message",
        message
      );

      form.append(
        "access_token",
        ACCESS_TOKEN
      );

      response = await fetch(
        `https://graph.facebook.com/v23.0/${PAGE_ID}/photos`,
        {
          method: "POST",
          body: form
        }
      );

    }

    // -------------------------------------------------
    // TEXT POST
    // -------------------------------------------------
    else {

      response = await fetch(
        `https://graph.facebook.com/v23.0/${PAGE_ID}/feed`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            message,

            access_token: ACCESS_TOKEN

          })

        }
      );

    }

    const data = await response.json();

    console.log("================================");
    console.log("Facebook Response");
    console.log(JSON.stringify(data, null, 2));
    console.log("================================");

    if (!response.ok) {

      return {

        success: false,

        message:
          data?.error?.message ||
          JSON.stringify(data)

      };

    }

    console.log("Facebook upload successful.");

    return {

      success: true,

      message:
        "Facebook post published successfully.",

      facebookPostId:
        data.post_id || data.id,

      facebookPayload: {

        title,

        message,

        imagePath: imagePath || null

      }

    };

  }

  catch (error) {

    console.error(error);

    return {

      success: false,

      message:
        error.message

    };

  }

}