const authService = require('./auth.service');
const { connect } = require('../database/connection'); 
const AppError = require('../utils/AppError');


jest.mock('../database/connection');

describe('Auth Service (Unit Tests)', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      get: jest.fn(),
      run: jest.fn(),
    };
    connect.mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve registrar um novo cliente com sucesso', async () => {
    const dadosCliente = {
      nome: 'Cliente Teste',
      email: 'teste@email.com',
      senha: '123',
    };

    mockDb.get.mockResolvedValue(null);
    mockDb.run.mockResolvedValue({ lastID: 1 });

    const novoCliente = await authService.registrarCliente(
      dadosCliente.nome,
      dadosCliente.email,
      dadosCliente.senha
    );

    expect(novoCliente).toBeDefined();
    expect(novoCliente.id).toBe(1);
    expect(novoCliente.email).toBe(dadosCliente.email);
    expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM User WHERE email = ?', [dadosCliente.email]);
  });

  it('deve lançar um erro se o e-mail já estiver em uso', async () => {
    const dadosCliente = {
      nome: 'Cliente Teste',
      email: 'existente@email.com',
      senha: '123',
    };
    
    mockDb.get.mockResolvedValue({
      id: 2,
      email: 'existente@email.com',
      nome: 'Outro Cliente',
    });

    await expect(
      authService.registrarCliente(dadosCliente.nome, dadosCliente.email, dadosCliente.senha)
    ).rejects.toThrow(new AppError('Este e-mail já está em uso.', 409));
    
    expect(mockDb.run).not.toHaveBeenCalled();
  });
});
