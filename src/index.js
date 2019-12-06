require('dotenv').config();

const express = require('express');

const db = require('./database/connection');

const server = express();

const PORT = process.env.PORT || 8080;
const DOMAIN = process.domain || 'localhost';

server.set('port', PORT);

server.get('/', async (req, res) => {
  const a = await db.testConnection();
  res.status(200).send(a);
});

server.listen(PORT, () => {
  console.log(`Server listening on http://${DOMAIN}:${PORT}`);
});
