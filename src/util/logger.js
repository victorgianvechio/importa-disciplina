import { createWriteStream } from 'fs';
import { format } from 'util';
import { resolve, join } from 'path';

const logStdout = process.stdout;

let logFile = '';
let logPath = '';

logPath = resolve(__dirname, '..', '..', 'public', 'logs');

const createFile = name => {
  logFile = createWriteStream(join(logPath, `insert_${name}.log`), {
    flags: 'w',
  });
};

// Gera arquivo de Log com nome extraído
const debug = async d => {
  logFile.write(`${format(d)}\n`);
  logStdout.write(`${format(d)}\n`);
};

export { debug, createFile };
