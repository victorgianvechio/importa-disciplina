/* eslint-disable no-await-in-loop */
import 'dotenv/config';

import readXlsxFile from 'read-excel-file/node';
import { resolve } from 'path';
import { existsSync } from 'fs';

import { readSQL, getData, exec } from '../../database/connection';
import proxId from '../../database/spProxId';
import { createFile, debug } from '../../util/logger';

const importFile = async () => {
  const [file, ext] = process.argv[2].split('.');
  const ead = process.argv[3] && process.argv[3].toUpperCase();

  const filePath = resolve(
    __dirname,
    '..',
    '..',
    '..',
    'public',
    'files',
    `${file}.xlsx`
  );

  const existsFile = existsSync(filePath);

  if (!file || !existsFile) {
    process.exit(console.error('Arquivo não encontrado.'));
  }

  if (ext && ext !== 'xlsx') {
    process.exit(
      console.error('Formato de arquivo inválido. Utilize apenas ".xlsx".')
    );
  }

  const sqlInsertDisciplina = await readSQL('insertDisciplina.sql');
  const sqlVerificaDisciplina = await readSQL('verificaDisciplinaExiste.sql');
  const sqlInsertGradeCurric = await readSQL('insertGradeCurric.sql');
  const sqlVerificaGrade = await readSQL('verificaGradeExiste.sql');

  readXlsxFile(filePath).then(async rows => {
    let codDisciplina = '';
    let nroSeqGrade = '';

    const [codCurso, codGrade] = [rows[0][0], rows[1][0]];

    const existsGrade = await getData(sqlVerificaGrade, [codCurso, codGrade]);

    if (!existsGrade.length) {
      process.exit(console.error('Grade curricular não encontrada.'));
    }

    await createFile(`${file}`);
    await debug(`Quantidade de registros: ${rows.length - 2}\n`);

    for (let i = 2; i < rows.length; i += 1) {
      const [descDisciplina, cargaHoraria, etapa] = [
        rows[i][0],
        rows[i][1],
        rows[i][2],
      ];

      const data = await getData(sqlVerificaDisciplina, [
        descDisciplina,
        cargaHoraria,
      ]);

      if (!data.length) {
        codDisciplina = await proxId('DISCIPLINA');
        await exec(sqlInsertDisciplina, [
          codDisciplina,
          descDisciplina,
          cargaHoraria,
        ]);
      } else {
        codDisciplina = data[0].COD_DISCIPLINA;
      }

      nroSeqGrade = await proxId('GRADE_CURRIC');

      await exec(sqlInsertGradeCurric, [
        nroSeqGrade,
        codCurso,
        codGrade,
        codDisciplina,
        etapa,
        ead === 1 || ead === '--EAD' ? 1 : 0,
      ]);

      await debug(
        `COD_DISCIPLINA: ${codDisciplina}\t${descDisciplina}\n\tNRO_SEQ_GRADE: ${nroSeqGrade}\n\tEtapa: ${etapa}\n\tCH: ${cargaHoraria}\n`
      );
    }
  });
};

importFile();
