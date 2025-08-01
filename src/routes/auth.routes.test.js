const request = require('supertest');
const express = require('express');
const allRoutes = require('./index'); 
const authService = require('../services/auth.service');


jest.mock('../services/auth.service');


const app = express();
app.use(express.json());
app.use('/v1', allRoutes); 

describe('Auth Routes (Integration Tests)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /v1/auth/registrar/cliente - deve retornar 201 ao registrar com sucesso', async () => {
    
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

   
    authService.registrarCliente.mockResolvedValue(resultadoEsperado);

   
    const response = await request(app)
      .post('/v1/auth/registrar/cliente')
      .send(dadosCliente);

   
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(resultadoEsperado);
    expect(authService.registrarCliente).toHaveBeenCalledWith(
      dadosCliente.nome,
      dadosCliente.email,
      dadosCliente.senha
    );
  });
});
