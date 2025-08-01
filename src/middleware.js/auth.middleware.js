const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const config = require('../config');

const proteger = (tiposPermitidos = []) => (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Você não está logado! Por favor, faça o login para ter acesso.', 401));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    
  
    req.user = { id: decoded.id, tipo: decoded.tipo };

    
    if (tiposPermitidos.length > 0 && !tiposPermitidos.includes(decoded.tipo)) {
      return next(new AppError('Você não tem permissão para realizar esta ação.', 403));
    }

    next();
  } catch (err) {
    return next(new AppError('Token inválido ou expirado.', 401));
  }
};

module.exports = { proteger };