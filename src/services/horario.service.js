const { connect } = require('../database/connection');
const AppError = require('../utils/AppError');

/**
 * 
 * @param {object} data - 
 * @param {number} barbeiroId - 
 * @returns {Promise<object>} 
 */
const criarHorario = async (data, barbeiroId) => {
  const db = await connect();
  const { data_hora_inicio, data_hora_fim } = data;

  if (!data_hora_inicio || !data_hora_fim || new Date(data_hora_inicio) >= new Date(data_hora_fim)) {
    throw new AppError('A data de início deve ser anterior à data de fim e ambas devem ser fornecidas.', 400);
  }

  const conflito = await db.get(
    `SELECT id FROM Horario WHERE barbeiroId = ? AND data_hora_inicio < ? AND data_hora_fim > ?`,
    [barbeiroId, data_hora_fim, data_hora_inicio]
  );

  if (conflito) {
    throw new AppError('O horário solicitado entra em conflito com um horário já existente.', 409);
  }

  const result = await db.run(
    'INSERT INTO Horario (data_hora_inicio, data_hora_fim, barbeiroId) VALUES (?, ?, ?)',
    [data_hora_inicio, data_hora_fim, barbeiroId]
  );

  return {
    id: result.lastID,
    data_hora_inicio,
    data_hora_fim,
    barbeiroId,
    status: 'disponivel',
  };
};

/**
 * 
 * @returns {Promise<Array<object>>} 
 */
const listarDisponiveis = async () => {
  const db = await connect();
  const horarios = await db.all(`
    SELECT 
      h.id, h.data_hora_inicio, h.data_hora_fim, h.status,
      u.id as barbeiroId, u.nome as barbeiroNome
    FROM Horario h
    JOIN User u ON h.barbeiroId = u.id
    WHERE h.status = 'disponivel' AND h.data_hora_inicio >= datetime('now','localtime')
    ORDER BY h.data_hora_inicio ASC
  `);
  return horarios;
};

/**
 * 
 * @param {number} horarioId 
 * @param {number} barbeiroId 
 */
const deletarHorario = async (horarioId, barbeiroId) => {
  const db = await connect();
  const horario = await db.get('SELECT * FROM Horario WHERE id = ?', [horarioId]);

  if (!horario) {
    throw new AppError('Horário não encontrado.', 404);
  }
  if (horario.barbeiroId !== barbeiroId) {
    throw new AppError('Você não tem permissão para deletar este horário.', 403);
  }
  if (horario.status === 'agendado') {
    throw new AppError('Não é possível deletar um horário que já foi agendado.', 409);
  }

  await db.run('DELETE FROM Horario WHERE id = ?', [horarioId]);
};

module.exports = { criarHorario, listarDisponiveis, deletarHorario };
