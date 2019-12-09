import { decrypt } from '../util/crypto';

const dbConfig = {
  username: decrypt(
    process.env.DB_USER,
    process.env.ENCRYPTION_KEY,
    process.env.ALGORITHM
  ),
  password: decrypt(
    process.env.DB_PASS,
    process.env.ENCRYPTION_KEY,
    process.env.ALGORITHM
  ),
  connectString: process.env.CONNECT_STRING,
};

export default dbConfig;
