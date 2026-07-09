// Purpose: Create a reusable Supabase client for the project.
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

// Test the connection by fetching a single row from the posts table.
export async function testConnection() {
  const { data, error } = await supabase.from('posts').select('*').limit(1);

  if (error) {
    throw new Error(`Supabase connection test failed: ${error.message}`);
  }

  return { data, error: null };
}
