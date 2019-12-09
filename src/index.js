import 'dotenv/config';

import express from 'express';

import { testConnection } from './database/connection';

const server = express();

const PORT = process.env.PORT || 8080;
const DOMAIN = process.domain || 'localhost';

server.set('port', PORT);

server.get('/', async (req, res) => {
  const a = await testConnection();
  res.status(200).send(a);
});

server.listen(PORT, () => {
  console.log(`Server listening on http://${DOMAIN}:${PORT}`);
});
