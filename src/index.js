import { buildFacebookPostPrompt } from './prompts/facebookPostPrompt.js';
import { generateContent } from './services/geminiService.js';

async function main() {
  try {
    const prompt = buildFacebookPostPrompt();
    const responseText = await generateContent(prompt);

    console.log('=== Generated Facebook Post ===');
    console.log(responseText);
  } catch (error) {
    console.error('Failed to generate Facebook post:', error.message);
    process.exit(1);
  }
}

main();
