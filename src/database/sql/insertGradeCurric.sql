INSERT INTO GRADE_CURRIC (
  NRO_SEQ_GRADE,
  COD_CURSO,
  COD_GRADE,
  COD_DISCIPLINA,
  ETAPA,
  PRE_REQUISITO,
  GRAVA_NOTA_HIST,
  REPROVA_NOTA,
  REPROVA_FREQ,
  ESPECIALIZACAO,
  COD_HABILITACAO,
  EMENTA,
  EXTRA_CURRICULAR,
  OBJETIVO,
  EAD,
  AVIN_ESTAGIO
)
VALUES (
  :NRO_SEQ_GRADE,
  :COD_CURSO,
  :COD_GRADE,
  :COD_DISCIPLINA,
  :ETAPA,
  '0',
  '1',
  '1',
  '1',
  '0',
  NULL,
  NULL,
  '0',
  NULL,
  :EAD,
  '0'
)
