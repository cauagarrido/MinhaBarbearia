const { Router } = require('express');
const horarioController = require('../controllers/horario.controller');
const { proteger } = require('../middlewares/auth.middleware');
const router = Router();

// Rota pública para ver horários disponíveis
router.get('/disponiveis', horarioController.listarDisponiveis);

// Rotas protegidas apenas para BARBEIRO
router.post('/', proteger(['BARBEIRO']), horarioController.criar);
router.delete('/:id', proteger(['BARBEIRO']), horarioController.deletar);

module.exports = router;