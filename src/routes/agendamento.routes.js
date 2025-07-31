const { Router } = require('express');
const agendamentoController = require('../controllers/agendamento.controller');
const { proteger } = require('../middlewares/auth.middleware');
const router = Router();

// Rota para cliente ver seus próprios agendamentos
router.get('/meus-agendamentos', proteger(['CLIENTE']), agendamentoController.listarMeus);

// Rota para cliente criar um agendamento
router.post('/', proteger(['CLIENTE']), agendamentoController.criar);

// Rota para cliente OU barbeiro cancelar um agendamento
router.delete('/:id', proteger(['CLIENTE', 'BARBEIRO']), agendamentoController.cancelar);

module.exports = router;