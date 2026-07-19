// Purpose: Create a reusable Supabase client for the project and verify storage/database connectivity.
// This file uses ES modules and loads environment variables from a local .env file.

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env into process.env.
dotenv.config();

// Read the Supabase configuration from the environment.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Throw a clear error if the required environment variables are missing.
if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL in environment variables.');
}

if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY in environment variables.');
}

// Create and export the Supabase client instance.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Test the database connection by fetching a single row from the posts table.
 * * @returns {Promise<Object>}
 */
export async function testConnection() {
  const { data, error } = await supabase.from('posts').select('*').limit(1);

  if (error) {
    throw new Error(`Supabase database connection test failed: ${error.message}`);
  }

  return { data, error: null };
}

/**
 * New Diagnostic Helper: Tests if a specific storage bucket exists and is accessible.
 * This directly helps troubleshoot the "Bucket not found" error during the workflow.
 * * @param {string} bucketName - The name of the storage bucket to verify (e.g., 'post-images')
 * @returns {Promise<Object>}
 */
export async function verifyStorageBucket(bucketName) {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);

    if (error) {
      return { 
        success: false, 
        message: `Bucket '${bucketName}' check failed: ${error.message}. Please check if the bucket exists in Supabase Dashboard and is set to Public.` 
      };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}