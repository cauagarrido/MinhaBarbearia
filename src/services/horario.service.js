const prisma = require('../database/prisma');
const AppError = require('../utils/AppError');

const criarHorario = async (data, barbeiroId) => {
  const { data_hora_inicio, data_hora_fim } = data;

  
  const conflito = await prisma.horario.findFirst({
    where: {
      barbeiroId: barbeiroId,
      OR: [
        {
          data_hora_inicio: { lt: data_hora_fim },
          data_hora_fim: { gt: data_hora_inicio },
        },
      ],
    },
  });

  if (conflito) {
    throw new AppError('O horário solicitado entra em conflito com um horário já existente.', 409);
  }

  const novoHorario = await prisma.horario.create({
    data: {
      data_hora_inicio,
      data_hora_fim,
      barbeiroId,
    },
  });

  return novoHorario;
};

const listarDisponiveis = async () => {
  const horarios = await prisma.horario.findMany({
    where: {
      status: 'disponivel',
      data_hora_inicio: {
        gte: new Date(),
      },
    },
    include: {
      barbeiro: {
        select: { id: true, nome: true },
      },
    },
    orderBy: {
      data_hora_inicio: 'asc',
    },
  });
  return horarios;
};

const deletarHorario = async (horarioId, barbeiroId) => {
  const horario = await prisma.horario.findUnique({
    where: { id: horarioId },
  });

  if (!horario) {
    throw new AppError('Horário não encontrado.', 404);
  }

  if (horario.barbeiroId !== barbeiroId) {
    throw new AppError('Você não tem permissão para deletar este horário.', 403);
  }

  if (horario.status === 'agendado') {
    throw new AppError('Não é possível deletar um horário que já foi agendado.', 409);
  }

  await prisma.horario.delete({
    where: { id: horarioId },
  });
};

module.exports = { criarHorario, listarDisponiveis, deletarHorario };