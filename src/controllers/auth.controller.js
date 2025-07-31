const authService = require('../services/auth.service');

const registrarCliente = async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;
    const novoCliente = await authService.registrarCliente(nome, email, senha);
    res.status(201).json(novoCliente);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    const data = await authService.login(email, senha);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = { registrarCliente, login };