const { Router } = require('express');
const authRouter = require('./auth.routes');
const horarioRouter = require('./horario.routes');
const agendamentoRouter = require('./agendamento.routes');

const router = Router();

// Agrupa as rotas por recurso
router.use('/auth', authRouter);
router.use('/horarios', horarioRouter);
router.use('/agendamentos', agendamentoRouter);

// Rota de "saúde" da API para verificar se está online
router.get('/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date() }));

module.exports = router;