const { connect } = require('../database/sqlite'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const config = require('../config');

const registrarCliente = async (nome, email, senha) => {
  const db = await connect();
  

  const userExists = await db.get('SELECT * FROM User WHERE email = ?', [email]);
  if (userExists) {
    throw new AppError('Este e-mail já está em uso.', 409);
  }


  const senhaHash = await bcrypt.hash(senha, 8);

 
  const result = await db.run(
    'INSERT INTO User (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
    [nome, email, senhaHash, 'CLIENTE']
  );

 
  return {
    id: result.lastID, 
    nome,
    email,
    tipo: 'CLIENTE',
  };
};

const login = async (email, senha) => {
  const db = await connect();
  const user = await db.get('SELECT * FROM User WHERE email = ?', [email]);

  if (!user || !(await bcrypt.compare(senha, user.senha))) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  const token = jwt.sign(
    { id: user.id, tipo: user.tipo },
    config.jwtSecret,
    { expiresIn: '1d' }
  );

  delete user.senha;
  return { usuario: user, token };
};

module.exports = { registrarCliente, login };
