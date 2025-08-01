const { Router } = require('express');
const authRouter = require('./auth.routes');
const horarioRouter = require('./horario.routes');
const agendamentoRouter = require('./agendamento.routes');

const router = Router();


router.use('/auth', authRouter);
router.use('/horarios', horarioRouter);
router.use('/agendamentos', agendamentoRouter);


router.get('/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date() }));

module.exports = router;