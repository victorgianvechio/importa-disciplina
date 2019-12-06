require('dotenv').config();

const readXlsxFile = require('read-excel-file/node');
const path = require('path');

const db = require('../../database/connection');
const proxID = require('../../database/spProxId');
const log = require('../../util/logger');

const importFile = async () => {
  const sqlInsert = await db.readSQL('insertDisciplina.sql');
  const sqlGet = await db.readSQL('verificaDisciplinaExiste.sql');

  return new Promise(resolve => {
    readXlsxFile(
      path.resolve(
        __dirname,
        '..',
        'public',
        'files',
        `${process.env.FILE_NAME}.xlsx`
      )
    ).then(async rows => {
      let codDisciplina = '';
      let descDisciplina = '';
      let cargaHoraria = '';
      let etapa = '';
      let status = '';
      let qtdOld = 0;
      let qtdNew = 0;
      let result = '';
      let i = '';

      await log.createFile(`${process.env.FILE_NAME}`);
      await log.debug(`Quantidade de registros: ${rows.length}\n`);

      for (i in rows) {
        descDisciplina = rows[i][0];
        cargaHoraria = rows[i][1];
        etapa = rows[i][2];

        result = await db.getData(sqlGet, [descDisciplina, cargaHoraria]);

        if (!result.length) {
          codDisciplina = await proxID('DISCIPLINA');
          result = await db.exec(sqlInsert, [
            codDisciplina,
            descDisciplina,
            cargaHoraria,
          ]);

          status = 'NEW';
          qtdNew++;
        } else {
          codDisciplina = result[0].COD_DISCIPLINA;
          status = 'OLD';
          qtdOld++;
        }

        await log.debug(`${status}\t\t${codDisciplina}
          \t${descDisciplina}
          \tEtapa: ${etapa}
          \tCH: ${cargaHoraria}\n`);

        resolve(result);
      }
      await log.debug(
        `\nQuantidade nova: ${qtdNew}\nQuantidade existente: ${qtdOld}`
      );
    });
  });
};

importFile();
