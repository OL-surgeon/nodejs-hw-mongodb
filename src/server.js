const express = require('express');
const cors = require('cors');
const pino = require('pino-http');

function setupServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(pino());

  app.get('/', (req, res) => {
    res.send('Server is running');
  });

  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = setupServer;
