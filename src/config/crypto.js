/* eslint-disable new-cap */
const crypto = require('crypto');

const IV_LENGTH = 16;

const encrypt = (text, key, algorithm) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, new Buffer.from(key), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

const decrypt = (text, key, algorithm) => {
  const textParts = text.split(':');
  const iv = new Buffer.from(textParts.shift(), 'hex');
  const encryptedText = new Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, new Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

module.exports = { decrypt, encrypt };
