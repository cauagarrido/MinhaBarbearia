const { connect } = require('../database/sqlite');
const AppError = require('../utils/AppError');

/**
 * Cria um novo agendamento para um cliente.
 * @param {number} horarioId - O ID do horário a ser agendado.
 * @param {number} clienteId - O ID do cliente que está agendando.
 * @returns {Promise<object>} O objeto do agendamento criado.
 */
const criarAgendamento = async (horarioId, clienteId) => {
  const db = await connect();
  try {
    // Inicia a transação para garantir a consistência dos dados
    await db.exec('BEGIN TRANSACTION');

    // 1. Busca o horário e verifica se está disponível
    const horario = await db.get(
      "SELECT * FROM Horario WHERE id = ? AND status = 'disponivel'",
      [horarioId]
    );

    if (!horario) {
      // Se não encontrou, desfaz a transação e lança o erro
      await db.exec('ROLLBACK');
      throw new AppError('Horário não encontrado ou não está mais disponível.', 404);
    }

    // 2. Atualiza o status do horário para 'agendado'
    await db.run(
      "UPDATE Horario SET status = 'agendado' WHERE id = ?",
      [horarioId]
    );

    // 3. Cria o registro do agendamento
    const result = await db.run(
      'INSERT INTO Agendamento (horarioId, clienteId) VALUES (?, ?)',
      [horarioId, clienteId]
    );

    // Se todas as operações foram bem-sucedidas, "comita" as alterações
    await db.exec('COMMIT');

    return { id: result.lastID, horarioId, clienteId, status: 'confirmado' };

  } catch (error) {
    // Se qualquer passo falhou, garante que a transação seja desfeita
    await db.exec('ROLLBACK');
    // Re-lança o erro para o controlador lidar com a resposta HTTP
    if (error instanceof AppError) {
        throw error;
    }
    throw new AppError('Não foi possível criar o agendamento.', 500);
  }
};

/**
 * Lista todos os agendamentos de um cliente específico.
 * @param {number} clienteId - O ID do cliente.
 * @returns {Promise<Array<object>>} Uma lista dos agendamentos do cliente.
 */
const listarMeusAgendamentos = async (clienteId) => {
    const db = await connect();
    const agendamentos = await db.all(`
        SELECT
            a.id,
            a.status,
            h.data_hora_inicio,
            h.data_hora_fim,
            u.nome as barbeiroNome
        FROM Agendamento a
        JOIN Horario h ON a.horarioId = h.id
        JOIN User u ON h.barbeiroId = u.id
        WHERE a.clienteId = ? AND a.status = 'confirmado'
        ORDER BY h.data_hora_inicio ASC
    `, [clienteId]);
    return agendamentos;
};

/**
 * Cancela um agendamento, tornando o horário disponível novamente.
 * @param {number} agendamentoId - O ID do agendamento a ser cancelado.
 * @param {object} usuario - O objeto do usuário autenticado (contém id e tipo).
 */
const cancelarAgendamento = async (agendamentoId, usuario) => {
    const db = await connect();
    try {
        await db.exec('BEGIN TRANSACTION');

        const agendamento = await db.get(
            `SELECT a.*, h.barbeiroId FROM Agendamento a
             JOIN Horario h ON a.horarioId = h.id
             WHERE a.id = ?`,
            [agendamentoId]
        );

        if (!agendamento) {
            await db.exec('ROLLBACK');
            throw new AppError('Agendamento não encontrado.', 404);
        }

        // Checa permissão: ou é o cliente do agendamento, ou o barbeiro do horário
        const isClienteDono = usuario.tipo === 'CLIENTE' && agendamento.clienteId === usuario.id;
        const isBarbeiroDono = usuario.tipo === 'BARBEIRO' && agendamento.barbeiroId === usuario.id;

        if (!isClienteDono && !isBarbeiroDono) {
            await db.exec('ROLLBACK');
            throw new AppError('Você não tem permissão para cancelar este agendamento.', 403);
        }

        // Libera o horário novamente
        await db.run(
            "UPDATE Horario SET status = 'disponivel' WHERE id = ?",
            [agendamento.horarioId]
        );

        // Deleta o agendamento
        await db.run('DELETE FROM Agendamento WHERE id = ?', [agendamentoId]);

        await db.exec('COMMIT');

    } catch (error) {
        await db.exec('ROLLBACK');
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Não foi possível cancelar o agendamento.', 500);
    }
};

module.exports = {
    criarAgendamento,
    listarMeusAgendamentos,
    cancelarAgendamento
};
