/* eslint-disable no-await-in-loop */
require('dotenv').config();

const readXlsxFile = require('read-excel-file/node');
const path = require('path');

const db = require('./database/connection');
const proxID = require('./database/spProxId');
const log = require('./util/logger');

const importFile = async () => {
  const [file, ext] = process.argv[2].split('.');
  const ead = process.argv[3];

  if (!file) {
    process.exit(console.log('Arquivo não encontrado.'));
  }

  if (ext && ext !== 'xlsx') {
    process.exit(
      console.log('Formato de arquivo inválido. Utilize apenas ".xlsx".')
    );
  }

  const sqlInsertDisciplina = await db.readSQL('insertDisciplina.sql');
  const sqlVerificaDisciplina = await db.readSQL(
    'verificaDisciplinaExiste.sql'
  );
  const sqlInsertGradeCurric = await db.readSQL('insertGradeCurric.sql');

  const filePath = path.resolve(
    __dirname,
    '..',
    'public',
    'files',
    `${file}.xlsx`
  );

  readXlsxFile(filePath).then(async rows => {
    let codDisciplina = '';
    let nroSeqGrade = '';

    await log.createFile(`${file}`);
    await log.debug(`Quantidade de registros: ${rows.length}\n`);

    const [codCurso, codGrade] = [rows[0][0], rows[1][0]];

    for (let i = 2; i < rows.length; i += 1) {
      const [descDisciplina, cargaHoraria, etapa] = [
        rows[i][0],
        rows[i][1],
        rows[i][2],
      ];

      const data = await db.getData(sqlVerificaDisciplina, [
        descDisciplina,
        cargaHoraria,
      ]);

      if (!data.length) {
        codDisciplina = await proxID('DISCIPLINA');
        await db.exec(sqlInsertDisciplina, [
          codDisciplina,
          descDisciplina,
          cargaHoraria,
        ]);
      } else {
        codDisciplina = data[0].COD_DISCIPLINA;
      }

      nroSeqGrade = await proxID('GRADE_CURRIC');

      await db.exec(sqlInsertGradeCurric, [
        nroSeqGrade,
        codCurso,
        codGrade,
        codDisciplina,
        etapa,
        ead === 1 || ead === 'ead' || ead === 'EAD' ? 1 : 0,
      ]);

      await log.debug(
        `COD_DISCIPLINA: ${codDisciplina}\t${descDisciplina}\n\tNRO_SEQ_GRADE: ${nroSeqGrade}\n\tEtapa: ${etapa}\n\tCH: ${cargaHoraria}\n`
      );
    }
  });
};

importFile();
