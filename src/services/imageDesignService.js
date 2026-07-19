import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const OUTPUT_DIR_NAME = "generated-images/final";
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 675;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDirectory = path.resolve(__dirname, "../../", OUTPUT_DIR_NAME);

function escapeSvg(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function splitTextToLines(text, maxLines, maxCharsPerLine) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine || current === "") {
      current = candidate;
      continue;
    }

    lines.push(current);
    current = word;
    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (current) {
    lines.push(current);
  }

  if (lines.length > maxLines) {
    lines.length = maxLines;
  }

  if (lines.length === maxLines) {
    const lastLine = lines[maxLines - 1];
    if (lastLine.length > maxCharsPerLine) {
      lines[maxLines - 1] = `${lastLine.slice(0, maxCharsPerLine - 1).trim()}…`;
    }
  }

  return lines;
}

function buildOverlaySvg(titleLines, descriptionLines) {
  const titleText = titleLines.map((line, index) => `      <tspan x=\"50%\" dy=\"${index === 0 ? 0 : 1.05}em\">${escapeSvg(line)}</tspan>`).join("\n");
  const descriptionText = descriptionLines.map((line, index) => `      <tspan x=\"50%\" dy=\"${index === 0 ? 0 : 1.05}em\">${escapeSvg(line)}</tspan>`).join("\n");

  return `
<svg width=\"${TARGET_WIDTH}\" height=\"${TARGET_HEIGHT}\" xmlns=\"http://www.w3.org/2000/svg\">
  <defs>
    <linearGradient id=\"gradientOverlay\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
      <stop offset=\"0%\" stop-color=\"rgba(0,0,0,0.55)\" />
      <stop offset=\"40%\" stop-color=\"rgba(0,0,0,0.35)\" />
      <stop offset=\"100%\" stop-color=\"rgba(0,0,0,0)\" />
    </linearGradient>
  </defs>
  <rect width=\"100%\" height=\"100%\" fill=\"url(#gradientOverlay)\" />
  <rect x=\"0\" y=\"0\" width=\"100%\" height=\"260\" fill=\"rgba(0,0,0,0.35)\" />
  <text x=\"50%\" y=\"120\" text-anchor=\"middle\" fill=\"#ffffff\" font-family=\"Arial, Helvetica, sans-serif\" font-weight=\"700\" font-size=\"58\">
${titleText}
  </text>
  <text x=\"50%\" y=\"210\" text-anchor=\"middle\" fill=\"#ffffff\" font-family=\"Arial, Helvetica, sans-serif\" font-weight=\"400\" font-size=\"32\">
${descriptionText}
  </text>
</svg>
`.trim();
}

function formatOutputPath(imagePath) {
  const fileName = `final-${Date.now()}.png`;
  return path.join(outputDirectory, fileName);
}

function normalizeOutputPath(absolutePath) {
  const relative = path.relative(process.cwd(), absolutePath);
  return relative.split(path.sep).join("/");
}

async function ensureOutputDirectory() {
  await fs.promises.mkdir(outputDirectory, { recursive: true });
}

export async function createDesignedImage({ imagePath, title, description }) {
  try {
    if (!imagePath || typeof imagePath !== "string") {
      throw new Error("imagePath is required and must be a string.");
    }

    if (!title || typeof title !== "string") {
      throw new Error("title is required and must be a string.");
    }

    if (!description || typeof description !== "string") {
      throw new Error("description is required and must be a string.");
    }

    await ensureOutputDirectory();

    const titleLines = splitTextToLines(title, 2, 30);
    const descriptionLines = splitTextToLines(description, 2, 36);
    const overlaySvg = buildOverlaySvg(titleLines, descriptionLines);
    const outputPath = formatOutputPath(imagePath);

    await sharp(imagePath)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: "cover"
      })
      .composite([
        {
          input: Buffer.from(overlaySvg),
          blend: "over"
        }
      ])
      .png()
      .toFile(outputPath);

    return {
      success: true,
      imagePath: normalizeOutputPath(outputPath)
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}
