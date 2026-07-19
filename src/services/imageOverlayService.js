import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const BASE_IMAGE_WIDTH = 1200;
const BASE_IMAGE_HEIGHT = 630;
const OVERLAY_HEIGHT = 140;
const OUTPUT_FOLDER_NAME = "generated-images";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDirectory = path.resolve(__dirname, "../../", OUTPUT_FOLDER_NAME);

function getTimestamp() {
  return Date.now();
}

function normalizeTitleLines(title, maxLines = 2, maxCharsPerLine = 32) {
  const trimmedTitle = String(title || "").trim();
  if (!trimmedTitle) {
    return [""];
  }

  const words = trimmedTitle.split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= maxCharsPerLine || !currentLine) {
      currentLine = candidate;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;

    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  const usedWords = lines.flatMap(line => line.split(/\s+/));
  const remainingWords = words.slice(usedWords.length);

  if (remainingWords.length > 0 && lines.length === maxLines) {
    let lastLine = `${lines[lines.length - 1]} ${remainingWords.join(" ")}`.trim();
    if (lastLine.length > maxCharsPerLine) {
      lastLine = `${lastLine.slice(0, maxCharsPerLine - 1).trim()}…`;
    }
    lines[lines.length - 1] = lastLine;
  }

  return lines.slice(0, maxLines);
}

function escapeSvgText(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildOverlaySvg(titleLines) {
  const lineCount = titleLines.filter(Boolean).length;
  const textStartY = lineCount === 1 ? 82 : 60;

  const textSpans = titleLines
    .filter(Boolean)
    .map((line, index) => {
      const dy = index === 0 ? "0" : "1.1em";
      return `<tspan x=\"50%\" dy=\"${dy}\">${escapeSvgText(line)}</tspan>`;
    })
    .join("");

  return `
<svg width="${BASE_IMAGE_WIDTH}" height="${OVERLAY_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.6" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.35)" />
  <text x="50%" y="${textStartY}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="700" fill="#ffffff" filter="url(#shadow)">
    ${textSpans}
  </text>
</svg>
`.trim();
}

function formatOutputFilePath(timestamp) {
  const fileName = `final-${timestamp}.png`;
  return path.join(outputDirectory, fileName);
}

function normalizeOutputPath(absolutePath) {
  const relativePath = path.relative(process.cwd(), absolutePath);
  return relativePath.split(path.sep).join("/");
}

async function ensureOutputDirectory() {
  await fs.promises.mkdir(outputDirectory, { recursive: true });
}

export async function createOverlayImage(imagePath, title) {
  try {
    if (!imagePath || typeof imagePath !== "string") {
      throw new Error("imagePath is required and must be a string.");
    }

    if (!title || typeof title !== "string") {
      throw new Error("title is required and must be a string.");
    }

    await ensureOutputDirectory();

    const timestamp = getTimestamp();
    const outputFilePath = formatOutputFilePath(timestamp);
    const titleLines = normalizeTitleLines(title, 2, 34);
    const overlaySvg = buildOverlaySvg(titleLines);

    await sharp(imagePath)
      .resize(BASE_IMAGE_WIDTH, BASE_IMAGE_HEIGHT, {
        fit: "cover"
      })
      .composite([
        {
          input: Buffer.from(overlaySvg),
          top: 0,
          left: 0
        }
      ])
      .png()
      .toFile(outputFilePath);

    return {
      success: true,
      imagePath: normalizeOutputPath(outputFilePath)
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}
