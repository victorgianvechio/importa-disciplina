/* eslint-disable new-cap */
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const IV_LENGTH = 16;

const encrypt = (text, key, algorithm) => {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(algorithm, new Buffer.from(key), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

const decrypt = (text, key, algorithm) => {
  const textParts = text.split(':');
  const iv = new Buffer.from(textParts.shift(), 'hex');
  const encryptedText = new Buffer.from(textParts.join(':'), 'hex');
  const decipher = createDecipheriv(algorithm, new Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

export { decrypt, encrypt };
