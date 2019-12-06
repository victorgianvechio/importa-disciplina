const crypto = require('./crypto');

module.exports = {
  username: crypto.decrypt(
    process.env.DB_USER,
    process.env.ENCRYPTION_KEY,
    process.env.ALGORITHM
  ),
  password: crypto.decrypt(
    process.env.DB_PASS,
    process.env.ENCRYPTION_KEY,
    process.env.ALGORITHM
  ),
  connectString: process.env.CONNECT_STRING,
};
