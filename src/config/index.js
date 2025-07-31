// Este arquivo centraliza o acesso às variáveis de ambiente
// e pode ser expandido para outras configurações globais.

require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
};

module.exports = config;