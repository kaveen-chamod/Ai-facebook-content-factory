// Purpose: Upload final images to Supabase Storage.
// This service keeps image storage separate from the local filesystem.

import fs from "fs";
import path from "path";
import { retryAsync } from "../utils/retry.js";
import { supabase } from "./supabaseService.js";

// Read from .env file or fallback to the standard default "post-images"
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "post-images";
const STORAGE_FOLDER = "posts";

function createStoragePath(imagePath) {
  const extension = path.extname(imagePath) || ".png";
  return `${STORAGE_FOLDER}/${Date.now()}${extension}`;
}

/**
 * Upload a local image file to Supabase Storage.
 *
 * @param {string} imagePath - Local filesystem path to the image.
 * @returns {Promise<{success:true,path:string,publicUrl:string}>}
 */
export async function uploadImage(imagePath) {
  if (!imagePath || typeof imagePath !== "string") {
    throw new Error("imagePath is required and must be a string.");
  }

  // Debug log to explicitly show which bucket name the code is targeting in execution
  console.log(`[Storage] Target upload bucket: "${STORAGE_BUCKET}"`);

  const absolutePath = path.isAbsolute(imagePath)
    ? imagePath
    : path.resolve(process.cwd(), imagePath);

  let fileBuffer;
  try {
    fileBuffer = await fs.promises.readFile(absolutePath);
  } catch (error) {
    throw new Error(`Failed to read image from disk: ${error.message}`);
  }

  const storagePath = createStoragePath(absolutePath);

  const uploadTask = async () => {
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Supabase storage upload failed: ${uploadError.message} (Target Bucket: ${STORAGE_BUCKET})`);
    }

    const { data: publicUrlData, error: publicUrlError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    if (publicUrlError) {
      throw new Error(`Failed to generate public URL: ${publicUrlError.message}`);
    }

    return {
      success: true,
      path: storagePath,
      publicUrl: publicUrlData.publicUrl,
    };
  };

  return await retryAsync(uploadTask);
}