/* eslint-disable no-await-in-loop */
require('dotenv').config();

const readXlsxFile = require('read-excel-file/node');
const path = require('path');

const db = require('./database/connection');
const proxID = require('./database/spProxId');
const log = require('./util/logger');

const importFile = async () => {
  let file = process.argv[2];
  let ext = '';

  if (!file) {
    process.exit(console.log('Arquivo não encontrado.'));
  }

  [file, ext] = file.split('.');

  if (ext !== 'xlsx') {
    process.exit(
      console.log('Formato de arquivo inválido. Utilize apenas ".xlsx"')
    );
  }

  console.log(file, ext);

  const sqlInsert = await db.readSQL('insertDisciplina.sql');
  const sqlGet = await db.readSQL('verificaDisciplinaExiste.sql');

  const filePath = path.resolve(
    __dirname,
    '..',
    'public',
    'files',
    `${file}.xlsx`
  );

  readXlsxFile(filePath).then(async rows => {
    let codDisciplina = '';
    let qtdOld = 0;
    let qtdNew = 0;

    await log.createFile(`${file}`);
    await log.debug(`Quantidade de registros: ${rows.length}\n`);

    for (let i = 0; i < rows.length; i += 1) {
      const [descDisciplina, cargaHoraria, etapa] = [
        rows[i][0],
        rows[i][1],
        rows[i][2],
      ];

      const data = await db.getData(sqlGet, [descDisciplina, cargaHoraria]);

      if (!data.length) {
        codDisciplina = await proxID('DISCIPLINA');
        await db.exec(sqlInsert, [codDisciplina, descDisciplina, cargaHoraria]);
        qtdNew += 1;
      } else {
        codDisciplina = data[0].COD_DISCIPLINA;
        qtdOld += 1;
      }

      await log.debug(
        `${codDisciplina}\n\t${descDisciplina}\n\tEtapa: ${etapa}\n\tCH: ${cargaHoraria}\n`
      );
    }

    await log.debug(
      `\nQuantidade nova: ${qtdNew}\nQuantidade existente: ${qtdOld}`
    );
  });
};

importFile();
