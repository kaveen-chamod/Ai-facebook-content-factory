import { testConnection } from './services/supabaseService.js';
import { generateAndSavePost } from './services/postService.js';

async function main() {
  try {
    const connectionResult = await testConnection();
    console.log('✅ Supabase Connected');
    console.log('Returned row:', connectionResult.data);

    const insertedPost = await generateAndSavePost();

    console.log('✅ Post generated successfully');
    console.log('Inserted row:', insertedPost);
  } catch (error) {
    console.error('Post workflow failed:', error.message);
    process.exit(1);
  }
}

main();
