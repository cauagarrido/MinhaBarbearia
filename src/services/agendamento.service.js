const prisma = require('../database/prisma');
const AppError = require('../utils/AppError');

const criarAgendamento = async (horarioId, clienteId) => {
  // Usamos uma transação para garantir que as duas operações (update e create)
  // aconteçam com sucesso, ou nenhuma delas acontece. Isso evita race conditions.
  const agendamento = await prisma.$transaction(async (tx) => {
    const horario = await tx.horario.findFirst({
      where: { id: horarioId, status: 'disponivel' },
    });

    if (!horario) {
      throw new AppError('Horário não encontrado ou não está mais disponível.', 404);
    }

    await tx.horario.update({
      where: { id: horarioId },
      data: { status: 'agendado' },
    });

    const novoAgendamento = await tx.agendamento.create({
      data: {
        horarioId,
        clienteId,
      },
    });

    return novoAgendamento;
  });

  return agendamento;
};
// ... outras funções (listar, cancelar)
module.exports = { criarAgendamento };