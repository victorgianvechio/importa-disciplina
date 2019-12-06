const fs = require('fs');
const util = require('util');
const path = require('path');

const logStdout = process.stdout;

let logFile = '';
let logPath = '';

logPath = path.resolve(__dirname, '..', '..', 'public', 'logs');

const createFile = name => {
  logFile = fs.createWriteStream(path.join(logPath, `insert_${name}.log`), {
    flags: 'w',
  });
};

// Gera arquivo de Log com nome extraído
const debug = async d => {
  logFile.write(`${util.format(d)}\n`);
  logStdout.write(`${util.format(d)}\n`);
};

module.exports = { debug, createFile };
