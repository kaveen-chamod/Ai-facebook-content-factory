import { createImageProvider } from '../src/providers/image/providerFactory.js';

const provider = createImageProvider('google');

const result = await provider.generateImage(
  'A peaceful American park in autumn, smiling senior couple walking together, photorealistic, warm golden sunlight, realistic photography, 16:9'
);

console.log(result);