const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const router = Router();

// Endpoint para registrar clientes agora ficará em /auth/registrar/cliente
router.post('/registrar/cliente', authController.registrarCliente);
router.post('/login', authController.login);

module.exports = router;