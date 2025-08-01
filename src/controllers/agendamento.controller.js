const agendamentoService = require('../services/agendamento.service');

const criar = async (req, res, next) => {
  try {
    const { horarioId } = req.body;
    const clienteId = req.user.id;
    const novoAgendamento = await agendamentoService.criarAgendamento(horarioId, clienteId);
    res.status(201).json(novoAgendamento);
  } catch (error) {
    next(error);
  }
};

const listarMeus = async (req, res, next) => {
  try {
    const clienteId = req.user.id;
    const agendamentos = await agendamentoService.listarMeusAgendamentos(clienteId);
    res.status(200).json(agendamentos);
  } catch (error) {
    next(error);
  }
};

const cancelar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = req.user; 
    await agendamentoService.cancelarAgendamento(Number(id), usuario);
    res.status(200).json({ mensagem: 'Agendamento cancelado com sucesso.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { criar, listarMeus, cancelar };