import express from 'express';
import { testConnection } from './services/supabaseService.js';
import { startPostScheduler } from './scheduler/postScheduler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('AI Facebook Content Factory is running!');
});

async function main() {
  try {
    const connectionResult = await testConnection();
    console.log('✅ Supabase Connected');
    console.log('Returned row:', connectionResult.data);

    startPostScheduler();

    app.listen(PORT, () => {
      console.log(`🌐 Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}

main();
