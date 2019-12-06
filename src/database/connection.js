/*
  RESPONSÁVEL POR CONECTAR NO BANCO DE DADOS E EXECUTAR QUERYS
*/
const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');

const dbConfig = require('../config/database');

oracledb.outFormat = oracledb.OBJECT;

// EXECUTA QUERY SEM PARÂMETROS
const getTableData = async sql => {
  let conn = '';
  let result = '';

  try {
    conn = await oracledb.getConnection({
      user: dbConfig.username,
      password: dbConfig.password,
      connectString: dbConfig.connectString,
    });

    result = await conn.execute(sql);
    return result.rows;
  } catch (err) {
    console.error(`Error ${err.message}`);
    result = `Error ${err.message}`;
    return result;
  } finally {
    if (conn) await conn.close();
  }
};

// EXECUTA QUERY COM PARÂMETROS
const getTableDataParam = async (sql, param) => {
  let conn = '';
  let result = '';

  try {
    conn = await oracledb.getConnection({
      user: dbConfig.username,
      password: dbConfig.password,
      connectString: dbConfig.connectString,
    });

    result = await conn.execute(sql, param);
    return result.rows;
  } catch (err) {
    console.error(`Error ${err.message}`);
    result = `Error ${err.message}`;
    return result;
  } finally {
    if (conn) await conn.close();
  }
};

// EXECUTA PROCEDURE E DEVOLVE PARAMETRO DE RETORNO
const execProcedure = async (sql, ptabela) => {
  let conn = '';
  let result = '';

  const param = {
    ptabela,
    pretorno: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    conn = await oracledb.getConnection({
      user: dbConfig.username,
      password: dbConfig.password,
      connectString: dbConfig.connectString,
    });

    result = await conn.execute(sql, param);
    return result.outBinds;
  } catch (err) {
    console.error(`Error ${err.message}`);
    result = `Error ${err.message}`;
    return result;
  } finally {
    if (conn) await conn.close();
  }
};

// EXECUTA INSERT, UPDATE E DELETE
const execDML = async (sql, param) => {
  let conn = '';
  let result = '';

  try {
    conn = await oracledb.getConnection({
      user: dbConfig.username,
      password: dbConfig.password,
      connectString: dbConfig.connectString,
    });

    const options = {
      autoCommit: true,
    };

    result = await conn.execute(sql, param, options);
    return result.rowsAffected;
  } catch (err) {
    console.error(`Error ${err.message}`);
    result = `Error ${err.message}`;
    return result;
  } finally {
    if (conn) await conn.close();
  }
};

// TESTA CONEXÃO
const testConnection = async () => {
  let conn = '';
  let result = '';

  try {
    conn = await oracledb.getConnection({
      user: dbConfig.username,
      password: dbConfig.password,
      connectString: dbConfig.connectString,
    });
    result = { connection: true };
    return result;
  } catch (err) {
    console.error(`Error ${err.message}`);
    result = `Error ${err.message}`;
    return result;
  } finally {
    if (conn) await conn.close();
  }
};

const readSQL = async fileName => {
  const sql = await fs
    .readFileSync(path.resolve(__dirname, 'sql', fileName))
    .toString();
  return sql;
};

// IDENTIFICA SE FOI PASSADO PARÂMETRO PARA A QUERY E CHAMA O MÉTODO RESPONSÁVEL
function redirectFunction(param1, param2) {
  if (typeof param2 === 'undefined') return getTableData(param1);
  return getTableDataParam(param1, param2);
}

module.exports = {
  getData: redirectFunction,
  execProcedure,
  exec: execDML,
  readSQL,
  testConnection,
};
