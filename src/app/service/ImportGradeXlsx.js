/* eslint-disable no-await-in-loop */
import 'dotenv/config';

import readXlsxFile from 'read-excel-file/node';
import { resolve } from 'path';
import { existsSync } from 'fs';

import { readSQL, getData, exec } from '../../database/connection';
import proxId from '../../database/spProxId';
import { createFile, debug } from '../../util/logger';

const importFile = async () => {
  // Pega os argumentos usados no CMD (nome do arquivo, extensão e parâmetro EAD)
  const [file, ext] = process.argv[2].split('.');
  const ead = process.argv[3] && process.argv[3].toUpperCase();

  // Diretório onde devem estar os arquivos a serem importados
  const filePath = resolve(
    __dirname,
    '..',
    '..',
    '..',
    'public',
    'files',
    `${file}.xlsx`
  );

  // Executa validações de arquivo e extensão (aceita apenas .xlsx)
  const existsFile = existsSync(filePath);

  if (!file || !existsFile) {
    process.exit(console.error('Arquivo não encontrado.'));
  }

  if (ext && ext !== 'xlsx') {
    process.exit(
      console.error('Formato de arquivo inválido. Utilize apenas ".xlsx".')
    );
  }

  // Carrega os arquivos SQL
  const sqlInsertDisciplina = await readSQL('insertDisciplina.sql');
  const sqlVerificaDisciplina = await readSQL('verificaDisciplinaExiste.sql');
  const sqlInsertGradeCurric = await readSQL('insertGradeCurric.sql');
  const sqlMaxCodGrade = await readSQL('getMaxCodGrade.sql');
  const sqlInsertGrade = await readSQL('insertGrade.sql');

  // Função que lê o arquivo .xlsx e retorna as linhas
  readXlsxFile(filePath).then(async rows => {
    // Primeira linha deve contar o código do curso, nome da grade e CH da atividade complementar
    const [codCurso, descricaoGrade, ativComplementarCH] = [
      rows[0][0],
      rows[0][1],
      rows[0][2],
    ];

    // Pega o ultimo COD_GRADE e soma um
    const codGrade = await getData(sqlMaxCodGrade, [codCurso]).then(
      data => data[0].COD_GRADE + 1
    );

    // Insert GRADE
    await exec(sqlInsertGrade, [
      codCurso,
      codGrade,
      descricaoGrade,
      ativComplementarCH,
    ]).then(
      result =>
        result !== 1 && process.exit(console.error('Insert GRADE:', result))
    );

    // Cria o arquivo de LOG
    await createFile(`${file}`);
    await debug(`Quantidade de registros: ${rows.length - 1}\n`);

    // Laço que percorre cada linha do arquivo .xlsx
    for (let i = 1; i < rows.length; i += 1) {
      const [descDisciplina, cargaHoraria, etapa] = [
        rows[i][0],
        rows[i][1],
        rows[i][2],
      ];

      let codDisciplina = '';

      // Pesquisa se a DISCIPLINA existe (descrição e carga horária)
      codDisciplina = await getData(sqlVerificaDisciplina, [
        descDisciplina,
        cargaHoraria,
      ]).then(data => (data.length ? data[0].COD_DISCIPLINA : false));

      // Insert DISCIPLINA (caso não exista)
      if (!codDisciplina) {
        codDisciplina = await proxId('DISCIPLINA');
        await exec(sqlInsertDisciplina, [
          codDisciplina,
          descDisciplina,
          cargaHoraria,
        ]).then(
          result =>
            result !== 1 &&
            process.exit(
              'INSERT DISCIPLINA: ',
              console.error('Insert DISCIPLINA:', result)
            )
        );
      }

      // Pega o ultimo NRO_SEQ_GRADE
      const nroSeqGrade = await proxId('GRADE_CURRIC');

      // Insert GRADE_CURRIC
      await exec(sqlInsertGradeCurric, [
        nroSeqGrade,
        codCurso,
        codGrade,
        codDisciplina,
        etapa,
        ead === 1 || ead === '--EAD' ? 1 : 0,
      ]).then(
        result =>
          result !== 1 &&
          process.exit(
            'INSERT GRADE_CURRIC: ',
            console.error('Insert GRADE_CURRIC:', result)
          )
      );

      // Insere no arquivo de LOG
      await debug(
        `COD_DISCIPLINA: ${codDisciplina}\t${descDisciplina}\n\tNRO_SEQ_GRADE: ${nroSeqGrade}\n\tEtapa: ${etapa}\n\tCH: ${cargaHoraria}\n`
      );
    }
  });
};

importFile();
