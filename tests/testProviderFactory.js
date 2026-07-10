import { getImageProvider } from "../src/config/imageConfig.js";
import { createImageProvider } from "../src/providers/image/providerFactory.js";

const providerName = getImageProvider();

const provider = createImageProvider(providerName);

console.log("Provider:", providerName);
console.log(provider);