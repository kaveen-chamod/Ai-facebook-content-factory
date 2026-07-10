// Purpose: Read and validate the configured image provider from the environment.
// This keeps provider selection centralized and easy to change without touching the rest of the app.

import dotenv from 'dotenv';

// Load environment variables from .env into process.env.
dotenv.config();

// The only image provider currently supported by the architecture.
const SUPPORTED_PROVIDERS = ['google'];

/**
 * Resolve the active image provider name from the environment.
 * If IMAGE_PROVIDER is not set, the default provider is google.
 * @returns {string} The validated provider name.
 */
export function getImageProvider() {
  const configuredProvider = process.env.IMAGE_PROVIDER?.trim().toLowerCase();

  // Fall back to the default provider when the environment variable is missing.
  if (!configuredProvider) {
    return 'google';
  }

  // Ensure the selected provider is one of the supported values.
  if (!SUPPORTED_PROVIDERS.includes(configuredProvider)) {
    throw new Error(`Unsupported image provider: ${configuredProvider}`);
  }

  return configuredProvider;
}
