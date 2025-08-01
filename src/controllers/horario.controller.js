const horarioService = require('../services/horario.service');

const criar = async (req, res, next) => {
  try {
    
    const barbeiroId = req.user.id;
    const novoHorario = await horarioService.criarHorario(req.body, barbeiroId);
    res.status(201).json(novoHorario);
  } catch (error) {
    next(error);
  }
};

const listarDisponiveis = async (req, res, next) => {
  try {
    const horarios = await horarioService.listarDisponiveis();
    res.status(200).json(horarios);
  } catch (error) {
    next(error);
  }
};

const deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const barbeiroId = req.user.id;
    await horarioService.deletarHorario(Number(id), barbeiroId);
    res.status(204).send(); 
  } catch (error) {
    next(error);
  }
};

module.exports = { criar, listarDisponiveis, deletar };