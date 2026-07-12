import { GoogleImageProvider } from "./googleImageProvider.js";
import { PollinationsImageProvider } from "./pollinationsImageProvider.js";

export function createImageProvider(
    provider = process.env.IMAGE_PROVIDER || "google"
) {

    switch (provider) {

        case "google":
            return new GoogleImageProvider();

        case "pollinations":
            return new PollinationsImageProvider();

        default:
            throw new Error(`Unsupported image provider: ${provider}`);
    }

}