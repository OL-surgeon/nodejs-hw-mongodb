import dotenv from 'dotenv';
import { setupServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';

dotenv.config();

async function startApp() {
  await initMongoConnection();
  setupServer();
}

startApp();
