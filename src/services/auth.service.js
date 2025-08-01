const prisma = require('../database/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const config = require('../config');

const registrarCliente = async (nome, email, senha) => {
  const emailEmUso = await prisma.user.findUnique({ where: { email } });
  if (emailEmUso) {
    throw new AppError('Este e-mail já está em uso.', 409);
  }

  const senhaHash = await bcrypt.hash(senha, 8);

  const cliente = await prisma.user.create({
    data: {
      nome,
      email,
      senha: senhaHash,
      tipo: 'CLIENTE',
    },
    select: { id: true, nome: true, email: true, tipo: true },
  });

  return cliente;
};

const login = async (email, senha) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(senha, user.senha))) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  const token = jwt.sign(
    { id: user.id, tipo: user.tipo },
    config.jwtSecret,
    { expiresIn: '1d' }
  );

  const { senha: _, ...usuarioLogado } = user;

  return { usuario: usuarioLogado, token };
};

module.exports = { registrarCliente, login };