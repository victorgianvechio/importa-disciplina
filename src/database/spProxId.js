import { execProcedure } from './connection';

const proxId = async ptabela => {
  const sql = 'BEGIN SP_PROX_ID(:ptabela, :pretorno); END;';

  const result = await execProcedure(sql, ptabela);
  return result.pretorno;
};

export default proxId;
