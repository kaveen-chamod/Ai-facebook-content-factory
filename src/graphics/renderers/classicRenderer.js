// Purpose: Render the first version of a classic Facebook-style graphic using the canvas package.
// This renderer uses the shared template configuration to keep the output consistent and maintainable.

import { createCanvas } from 'canvas';
import { promises as fs } from 'fs';
import path from 'path';
import { classicTemplate } from '../templates/classicTemplate.js';

/**
 * Wrap long text into multiple lines so it fits within the available drawing width.
 * @param {CanvasRenderingContext2D} context - The canvas drawing context.
 * @param {string} text - The text to wrap.
 * @param {number} maxWidth - Maximum width available for the text.
 * @returns {string[]} An array of wrapped lines.
 */
function wrapText(context, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0] || '';

  for (let index = 1; index < words.length; index += 1) {
    const word = words[index];
    const testLine = `${currentLine} ${word}`;

    if (context.measureText(testLine).width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Render a classic social media graphic and save it as a PNG file.
 * @param {{title?: string, subtitle?: string, footer?: string}} data - Graphic text content.
 * @returns {Promise<string>} The full output path for the generated image.
 */
export async function renderClassicGraphic(data = {}) {
  try {
    // Load the shared template configuration so the renderer stays aligned with the design system.
    const template = classicTemplate;

    // Use the template canvas dimensions instead of hard-coded values.
    const canvas = createCanvas(template.canvasWidth, template.canvasHeight);
    const context = canvas.getContext('2d');

    // Resolve the content values from the incoming data or fall back to template defaults.
    const titleText = data.title || 'AI Facebook Content Factory';
    const subtitleText = data.subtitle || template.subtitle.text;
    const footerText = data.footer || template.footer.text;

    // Fill the entire canvas with the background color from the template.
    context.fillStyle = template.colors.background;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Apply an optional overlay for better readability when the template enables it.
    if (template.overlay.enabled) {
      context.fillStyle = template.overlay.color;
      context.globalAlpha = template.overlay.opacity;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = 1;
    }

    // Draw a border around the graphic when the template requests one.
    if (template.border.enabled) {
      context.strokeStyle = template.border.color;
      context.lineWidth = template.border.width;
      context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    }

    // Draw the title centered near the upper portion of the canvas.
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = template.colors.title;
    context.font = `${template.title.fontWeight} ${template.title.fontSize}px ${template.fonts.title}`;

    const titleLines = wrapText(context, titleText, template.title.maxWidth || canvas.width - 200);
    const titleStartY = canvas.height * 0.35;

    titleLines.forEach((line, index) => {
      context.fillText(line, canvas.width / 2, titleStartY + index * 90);
    });

    // Draw the subtitle below the title using the template's subtitle styling.
    context.fillStyle = template.colors.subtitle;
    context.font = `${template.subtitle.fontSize}px ${template.fonts.subtitle}`;
    const subtitleLines = wrapText(context, subtitleText, template.title.maxWidth || canvas.width - 200);
    const subtitleStartY = canvas.height * 0.55;

    subtitleLines.forEach((line, index) => {
      context.fillText(line, canvas.width / 2, subtitleStartY + index * 44);
    });

    // Draw the footer at the bottom center of the canvas.
    context.fillStyle = template.colors.footer;
    context.font = `${template.footer.fontSize}px ${template.fonts.body}`;
    context.fillText(footerText, canvas.width / 2, canvas.height - 90);

    // Create the output directory automatically so the renderer can write the image reliably.
    const outputDir = path.resolve(process.cwd(), 'output');
    await fs.mkdir(outputDir, { recursive: true });

    // Save the generated PNG file to the output folder.
    const outputPath = path.join(outputDir, 'sample-post.png');
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);

    // Return the fully qualified output path so other modules can use it immediately.
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to render classic graphic: ${error.message}`);
  }
}
