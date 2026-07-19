// Purpose: Publish generated posts (with image) to a Facebook Page using Meta Graph API.
// Includes high-resilience network timeout control and an automatic binary fallback engine.

import dotenv from "dotenv";
import fs from "fs/promises";
import { retryAsync } from "../utils/retry.js";

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
 * Publish post to Facebook with advanced error resiliency and binary fallback handling.
 */
export async function publishPost(post) {
  if (!post || typeof post !== "object") {
    throw new Error("Invalid post object");
  }

  const { title, caption, hashtags, imageUrl, imagePath } = post;

  if (!title?.trim()) throw new Error("Title is required.");
  if (!caption?.trim()) throw new Error("Caption is required.");
  if (!PAGE_ID || !ACCESS_TOKEN) throw new Error("Missing FACEBOOK_PAGE_ID or FACEBOOK_ACCESS_TOKEN.");

  const tagsArray = normalizeHashtags(hashtags);
  const message = buildFacebookMessage(caption, tagsArray);

  // Core internal task runner configured to wrap retries safely
  const publishTask = async () => {
    let response;
    // Set an extended custom network timeout using AbortController (60 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      if (imageUrl) {
        console.log("==========================================");
        console.log("[Meta API] Route A: Ingesting image by hosted URL...");
        console.log(`Page ID: ${PAGE_ID} | Target URL: ${imageUrl}`);
        console.log("==========================================");

        response = await fetch(
          `https://graph.facebook.com/v23.0/${PAGE_ID}/photos`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              url: imageUrl,
              message,
              access_token: ACCESS_TOKEN,
            }),
          }
        );
      } else {
        // Drop straight to manual feed fallback routing if no URL assets exist
        throw new Error("Trigger Direct Ingestion Dropdown");
      }
    } catch (urlMethodError) {
      // CLEAR SECURE TIMEOUT PREVENTING RUNTIME FLOODS
      clearTimeout(timeoutId);

      // CRITICAL FALLBACK ROUTE: If hosted URL download times out or errors, deploy local binary multipart upload
      if (imagePath) {
        console.warn(`\n[Meta API Warning] Route A failed (${urlMethodError.message}). Deploying Route B Binary Fallback...`);
        console.log("==========================================");
        console.log(`[Meta API] Route B: Streaming binary buffer via FormData...`);
        console.log(`Target Source File: ${imagePath}`);
        console.log("==========================================");

        const fallbackController = new AbortController();
        const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 90000); // 90 second buffer for binary data streams

        const imageBuffer = await fs.readFile(imagePath);
        const imageBlob = new Blob([imageBuffer], { type: "image/png" });

        const form = new FormData();
        form.append("source", imageBlob, "image.png");
        form.append("message", message);
        form.append("access_token", ACCESS_TOKEN);

        response = await fetch(
          `https://graph.facebook.com/v23.0/${PAGE_ID}/photos`,
          {
            method: "POST",
            signal: fallbackController.signal,
            body: form,
          }
        );
        clearTimeout(fallbackTimeoutId);
      } else {
        // Fallback completely out of image processing to text injection if zero binary states are detected
        console.error("[Meta API Critical] Ingestion pathways exhausting. Attemping text-only payload publishing injection...");
        response = await fetch(
          `https://graph.facebook.com/v23.0/${PAGE_ID}/feed`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message,
              access_token: ACCESS_TOKEN,
            }),
          }
        );
      }
    } finally {
      clearTimeout(timeoutId);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || JSON.stringify(data));
    }

    return {
      success: true,
      message: "Facebook post published successfully.",
      facebookPostId: data.post_id || data.id,
      facebookPayload: {
        title,
        message,
        imageUrl: imageUrl || null,
        imagePath: imagePath || null,
      },
    };
  };

  try {
    const result = await retryAsync(publishTask);
    console.log("==========================================");
    console.log("[Meta API] Transaction Confirmation Logged");
    console.log(`Facebook Post ID: ${result.facebookPostId}`);
    console.log("==========================================");
    return result;
  } catch (finalWorkflowError) {
    console.error("[Meta API Failure] Ingestion pipelines terminated:", finalWorkflowError.message);
    return {
      success: false,
      message: finalWorkflowError.message,
    };
  }
}