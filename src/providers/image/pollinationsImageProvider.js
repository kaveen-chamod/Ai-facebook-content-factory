import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PollinationsImageProvider {

    /**
     * Generate an AI image using Pollinations AI.
     * @param {string} prompt
     * @returns {Promise<string>} Local image path
     */
    async generateImage(prompt) {

        const encodedPrompt = encodeURIComponent(prompt);

        const imageUrl =
            `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}`;

        const response = await axios({
            url: imageUrl,
            method: "GET",
            responseType: "stream",
        });

        const outputDir = path.join(process.cwd(), "generated-images");

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const filename = `image-${Date.now()}.png`;

        const filePath = path.join(outputDir, filename);

        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

       return {
    success: true,
    imagePath: filePath,
};
    }

}