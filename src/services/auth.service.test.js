
const authService = require('./auth.service');

const { connect } = require('../database/sqlite');

const AppError = require('../utils/AppError');


jest.mock('../database/sqlite');

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
   
    const nome = 'Teste';
    const email = 'teste@email.com';
    const senha = '123';

   
    mockDb.get.mockResolvedValue(null); 
    mockDb.run.mockResolvedValue({ lastID: 1 }); 

  
    const result = await authService.registrarCliente(nome, email, senha);

    
    expect(result.id).toBe(1);
    expect(result.email).toBe(email);
    expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM User WHERE email = ?', [email]);
  });

  it('deve lançar um erro se o e-mail já estiver em uso', async () => {
    
    const nome = 'Teste';
    const email = 'existente@email.com';
    const senha = '123';

   
    mockDb.get.mockResolvedValue({ id: 1, email: 'existente@email.com' });

   
    await expect(
      authService.registrarCliente(nome, email, senha)
    ).rejects.toThrow(new AppError('Este e-mail já está em uso.', 409));

    
    expect(mockDb.run).not.toHaveBeenCalled();
  });
});