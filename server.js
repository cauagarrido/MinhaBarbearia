const express = require('express');
const cors = require('cors');
const config = require('./src/config');
const allRoutes = require('./src/routes');
const AppError = require('./src/utils/AppError');
const { connect } = require('./src/database/connection');

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000' // Altere para o endereço do seu frontend
}));
app.use(express.json());

// Rotas
app.use('/v1', allRoutes);

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Algo deu muito errado!',
  });
});

/**
 * Inicia o servidor apenas após garantir que a conexão com o banco de dados
 * foi estabelecida e o schema foi aplicado.
 */
async function startServer() {
  try {
    await connect(); // Garante que o DB está conectado e o schema aplicado
    
    app.listen(config.port, () => {
      console.log(`🚀 Servidor a rodar na porta ${config.port}`);
    });
  } catch (error) {
    console.error("❌ Falha ao iniciar o servidor", error);
    process.exit(1);
  }
}

startServer();
