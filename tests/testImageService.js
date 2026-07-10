import { generateImage } from '../src/services/imageService.js';

const result = await generateImage(
  'A warm American small town street in autumn, photorealistic, realistic seniors, golden sunlight, high quality photography'
);

console.log(result);