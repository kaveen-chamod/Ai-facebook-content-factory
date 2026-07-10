// Purpose: Render the first version of a classic Facebook-style graphic using the canvas package.
// This renderer is intentionally presentation-focused and does not generate AI images yet.

import { createCanvas } from 'canvas';
import { promises as fs } from 'fs';
import path from 'path';
import { classicTemplate } from '../templates/classicTemplate.js';

/**
 * Wrap long text into multiple lines so it fits the available canvas width.
 * @param {CanvasRenderingContext2D} context - The drawing context.
 * @param {string} text - The text to wrap.
 * @param {number} maxWidth - Maximum width available for the text.
 * @param {number} lineHeight - Space between wrapped lines.
 * @returns {string[]} An array of wrapped lines.
 */
function wrapText(context, text, maxWidth, lineHeight) {
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
 * @returns {Promise<string>} The output file path.
 */
export async function renderClassicGraphic(data = {}) {
  // Create the drawing surface with the required square dimensions.
  const canvas = createCanvas(1080, 1080);
  const context = canvas.getContext('2d');

  // Read the visual settings from the shared template configuration.
  const template = classicTemplate;
  const titleText = data.title || 'AI Facebook Content Factory';
  const subtitleText = data.subtitle || template.subtitle.text;
  const footerText = data.footer || template.footer.text;

  // Fill the background with the template's light neutral color.
  context.fillStyle = template.colors.background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Add a subtle overlay for improved text readability.
  if (template.overlay.enabled) {
    context.fillStyle = template.overlay.color;
    context.globalAlpha = template.overlay.opacity;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;
  }

  // Draw a border around the canvas using the template style.
  if (template.border.enabled) {
    context.strokeStyle = template.border.color;
    context.lineWidth = template.border.width;
    context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  }

  // Draw the main title in the center-upper region of the canvas.
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = template.colors.title;
  context.font = `${template.title.fontWeight} ${template.title.fontSize}px ${template.fonts.title}`;

  const titleLines = wrapText(context, titleText, 900, 70);
  const titleStartY = 360;

  titleLines.forEach((line, index) => {
    context.fillText(line, canvas.width / 2, titleStartY + index * 90);
  });

  // Draw the subtitle beneath the title in the center of the canvas.
  context.fillStyle = template.colors.subtitle;
  context.font = `${template.subtitle.fontSize}px ${template.fonts.subtitle}`;
  const subtitleLines = wrapText(context, subtitleText, 800, 36);
  const subtitleStartY = 560;

  subtitleLines.forEach((line, index) => {
    context.fillText(line, canvas.width / 2, subtitleStartY + index * 44);
  });

  // Draw the footer near the bottom of the canvas.
  context.fillStyle = template.colors.footer;
  context.font = `${template.footer.fontSize}px ${template.fonts.body}`;
  context.fillText(footerText, canvas.width / 2, 930);

  // Create the output directory automatically if it does not already exist.
  const outputDir = path.resolve(process.cwd(), 'output');
  await fs.mkdir(outputDir, { recursive: true });

  // Save the generated image to the output folder.
  const outputPath = path.join(outputDir, 'sample-post.png');
  const buffer = canvas.toBuffer('image/png');
  await fs.writeFile(outputPath, buffer);

  // Return the saved image path for downstream use.
  return outputPath;
}
