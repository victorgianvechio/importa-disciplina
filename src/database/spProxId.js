const db = require('./connection');

async function SP_PROX_ID(ptabela) {
  const sql = 'BEGIN SP_PROX_ID(:ptabela, :pretorno); END;';

  const result = await db.execProcedure(sql, ptabela);
  return result.pretorno;
}

module.exports = SP_PROX_ID;
