const request = require('supertest');
const express = require('express');
const allRoutes = require('./index'); // Importa o roteador principal
const authService = require('../services/auth.service');

// Mockamos todo o módulo de serviço
jest.mock('../services/auth.service');

// Criamos uma aplicação Express mínima apenas para os testes
const app = express();
app.use(express.json());
app.use('/v1', allRoutes); // Usamos as nossas rotas reais

describe('Auth Routes (Integration Tests)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /v1/auth/registrar/cliente - deve retornar 201 ao registrar com sucesso', async () => {
    // Arrange
    const dadosCliente = {
      nome: 'Cliente Novo',
      email: 'novo@email.com',
      senha: 'senha123',
    };
    const resultadoEsperado = {
      id: 1,
      nome: 'Cliente Novo',
      email: 'novo@email.com',
      tipo: 'CLIENTE',
    };

    // Dizemos ao nosso serviço mockado como ele deve se comportar
    authService.registrarCliente.mockResolvedValue(resultadoEsperado);

    // Act: Fazemos uma requisição HTTP real para a nossa app de teste
    const response = await request(app)
      .post('/v1/auth/registrar/cliente')
      .send(dadosCliente);

    // Assert: Verificamos a resposta HTTP
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(resultadoEsperado);
    expect(authService.registrarCliente).toHaveBeenCalledWith(
      dadosCliente.nome,
      dadosCliente.email,
      dadosCliente.senha
    );
  });
});
