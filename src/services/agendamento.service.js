const prisma = require('../database/prisma');
const AppError = require('../utils/AppError');

const criarAgendamento = async (horarioId, clienteId) => {
 
  const agendamento = await prisma.$transaction(async (tx) => {
    const horario = await tx.horario.findFirst({
      where: { id: horarioId },
    });

    if (!horario) {
      throw new AppError('Horário não encontrado.', 404);
    }
    if (horario.status !== 'disponivel') {
      throw new AppError('Este horário não está mais disponível.', 409);
    }

    await tx.horario.update({
      where: { id: horarioId },
      data: { status: 'agendado' },
    });

    const novoAgendamento = await tx.agendamento.create({
      data: {
        horarioId: horarioId,
        clienteId: clienteId,
      },
    });

    return novoAgendamento;
  });

  return agendamento;
};

const listarMeusAgendamentos = async (clienteId) => {
  const agendamentos = await prisma.agendamento.findMany({
    where: {
      clienteId,
      status: 'confirmado',
    },
    include: {
      horario: {
        include: {
          barbeiro: {
            select: { nome: true },
          },
        },
      },
    },
    orderBy: {
      horario: {
        data_hora_inicio: 'asc',
      },
    },
  });
  return agendamentos;
};

const cancelarAgendamento = async (agendamentoId, usuario) => {
  return prisma.$transaction(async (tx) => {
    const agendamento = await tx.agendamento.findUnique({
      where: { id: agendamentoId },
      include: { horario: true },
    });

    if (!agendamento) {
      throw new AppError('Agendamento não encontrado.', 404);
    }


    const isClienteDono = usuario.tipo === 'CLIENTE' && agendamento.clienteId === usuario.id;
    const isBarbeiroDono = usuario.tipo === 'BARBEIRO' && agendamento.horario.barbeiroId === usuario.id;

    if (!isClienteDono && !isBarbeiroDono) {
      throw new AppError('Você não tem permissão para cancelar este agendamento.', 403);
    }

   
    await tx.horario.update({
      where: { id: agendamento.horarioId },
      data: { status: 'disponivel' },
    });

    await tx.agendamento.delete({
      where: { id: agendamentoId },
    });
  });
};

module.exports = { criarAgendamento, listarMeusAgendamentos, cancelarAgendamento };