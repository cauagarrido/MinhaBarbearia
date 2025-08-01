const { connect } = require('../database/connection');
const AppError = require('../utils/AppError');

/**
 * 
 * @param {number} horarioId 
 * @param {number} clienteId 
 * @returns {Promise<object>} 
 */
const criarAgendamento = async (horarioId, clienteId) => {
  const db = await connect();
  try {
    await db.exec('BEGIN TRANSACTION');

    const horario = await db.get(
      "SELECT * FROM Horario WHERE id = ? AND status = 'disponivel'",
      [horarioId]
    );

    if (!horario) {
      await db.exec('ROLLBACK');
      throw new AppError('Horário não encontrado ou não está mais disponível.', 404);
    }

    await db.run(
      "UPDATE Horario SET status = 'agendado' WHERE id = ?",
      [horarioId]
    );

    const result = await db.run(
      'INSERT INTO Agendamento (horarioId, clienteId) VALUES (?, ?)',
      [horarioId, clienteId]
    );

    await db.exec('COMMIT');
    return { id: result.lastID, horarioId, clienteId, status: 'confirmado' };
  } catch (error) {
    await db.exec('ROLLBACK');
    if (error instanceof AppError) throw error;
    throw new AppError('Não foi possível criar o agendamento.', 500);
  }
};

/**
 * 
 * @param {number} clienteId 
 * @returns {Promise<Array<object>>} 
 */
const listarMeusAgendamentos = async (clienteId) => {
    const db = await connect();
    const agendamentos = await db.all(`
        SELECT a.id, a.status, h.data_hora_inicio, h.data_hora_fim, u.nome as barbeiroNome
        FROM Agendamento a
        JOIN Horario h ON a.horarioId = h.id
        JOIN User u ON h.barbeiroId = u.id
        WHERE a.clienteId = ? AND a.status = 'confirmado'
        ORDER BY h.data_hora_inicio ASC
    `, [clienteId]);
    return agendamentos;
};

/**
 * 
 * @param {number} agendamentoId 
 * @param {object} usuario 
 */
const cancelarAgendamento = async (agendamentoId, usuario) => {
    const db = await connect();
    try {
        await db.exec('BEGIN TRANSACTION');

        const agendamento = await db.get(
            `SELECT a.*, h.barbeiroId FROM Agendamento a JOIN Horario h ON a.horarioId = h.id WHERE a.id = ?`,
            [agendamentoId]
        );

        if (!agendamento) {
            await db.exec('ROLLBACK');
            throw new AppError('Agendamento não encontrado.', 404);
        }

        const isClienteDono = usuario.tipo === 'CLIENTE' && agendamento.clienteId === usuario.id;
        const isBarbeiroDono = usuario.tipo === 'BARBEIRO' && agendamento.barbeiroId === usuario.id;

        if (!isClienteDono && !isBarbeiroDono) {
            await db.exec('ROLLBACK');
            throw new AppError('Você não tem permissão para cancelar este agendamento.', 403);
        }

        await db.run("UPDATE Horario SET status = 'disponivel' WHERE id = ?", [agendamento.horarioId]);
        await db.run('DELETE FROM Agendamento WHERE id = ?', [agendamentoId]);
        await db.exec('COMMIT');
    } catch (error) {
        await db.exec('ROLLBACK');
        if (error instanceof AppError) throw error;
        throw new AppError('Não foi possível cancelar o agendamento.', 500);
    }
};

module.exports = { criarAgendamento, listarMeusAgendamentos, cancelarAgendamento };