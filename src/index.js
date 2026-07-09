import { buildFacebookPostPrompt } from './prompts/facebookPostPrompt.js';
import { generateContent } from './services/geminiService.js';
import { testConnection } from './services/supabaseService.js';

async function main() {
  try {
    const connectionResult = await testConnection();
    console.log('✅ Supabase Connected');
    console.log('Returned row:', connectionResult.data);

    const prompt = buildFacebookPostPrompt();
    const responseText = await generateContent(prompt);

    console.log('=== Generated Facebook Post ===');
    console.log(responseText);
  } catch (error) {
    console.error('Supabase connection failed:', error.message);
    process.exit(1);
  }
}

main();
