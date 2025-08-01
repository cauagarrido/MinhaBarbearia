const { Router } = require('express');
const agendamentoController = require('../controllers/agendamento.controller');
const { proteger } = require('../middlewares/auth.middleware');
const router = Router();


router.get('/meus-agendamentos', proteger(['CLIENTE']), agendamentoController.listarMeus);


router.post('/', proteger(['CLIENTE']), agendamentoController.criar);


router.delete('/:id', proteger(['CLIENTE', 'BARBEIRO']), agendamentoController.cancelar);

module.exports = router;