const { Router } = require('express');
const authRouter = require('./auth.routes');
// const horarioRouter = require('./horario.routes'); // Crie estes arquivos
// const agendamentoRouter = require('./agendamento.routes');

const router = Router();

router.use('/auth', authRouter);
// router.use('/horarios', horarioRouter);
// router.use('/agendamentos', agendamentoRouter);

// Rota de "saúde" da API
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

module.exports = router;