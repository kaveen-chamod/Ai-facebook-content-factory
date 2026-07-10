// Purpose: Centralize provider selection for the image generation architecture.
// This factory pattern keeps the rest of the application decoupled from specific providers.

import { GoogleImageProvider } from './googleImageProvider.js';

/**
 * Create an image provider instance based on the requested provider name.
 * @param {string} [provider='google'] - The provider identifier.
 * @returns {import('./imageProvider.js').ImageProvider} A provider instance.
 */
export function createImageProvider(provider = 'google') {
  if (provider === 'google') {
    return new GoogleImageProvider();
  }

  throw new Error(`Unsupported image provider: ${provider}`);
}
