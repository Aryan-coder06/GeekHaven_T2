import app from './app.js';
import { ENV } from './config/env.js';
import { connectMongo } from './db/mongo.js';

const { PORT } = ENV;

async function start() {
  try {
    await connectMongo(process.env.MONGODB_URL);
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Mongo connection failed:', err);
    process.exit(1);
  }
}

start();
