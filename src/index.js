import { setupServer } from './server.js';
const initMongoConnection = require('./db/initMongoConnection');

const startApp = async () => {
  await initMongoConnection();
  setupServer();
};

startApp();
