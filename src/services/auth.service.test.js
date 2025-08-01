
const authService = require('./auth.service');

const AppError = require('../utils/AppError');

const prisma = require('../database/prisma');


jest.mock('../database/prisma');


describe('Auth Service', () => {

  
  afterEach(() => {
    jest.clearAllMocks();
  });

  
  it('deve ser capaz de registrar um novo cliente com sucesso', async () => {
 
    const dadosCliente = {
      nome: 'Cliente Teste',
      email: 'teste@email.com',
      senha: '123',
    };

    
    prisma.user.findUnique.mockResolvedValue(null);

    prisma.user.create.mockResolvedValue({
      id: 1,
      ...dadosCliente,
      tipo: 'CLIENTE',
    });


    const novoCliente = await authService.registrarCliente(
      dadosCliente.nome,
      dadosCliente.email,
      dadosCliente.senha
    );

    expect(novoCliente).toBeDefined();
    expect(novoCliente.id).toBe(1);
    expect(novoCliente.email).toBe(dadosCliente.email); 
   
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: dadosCliente.email })
    );
  });

  
  it('deve lançar um erro se o e-mail já estiver em uso', async () => {
   
    const dadosCliente = {
      nome: 'Cliente Teste',
      email: 'existente@email.com',
      senha: '123',
    };
    
    
    prisma.user.findUnique.mockResolvedValue({
      id: 2,
      email: 'existente@email.com',
      nome: 'Outro Cliente',
    });

   
    await expect(
      authService.registrarCliente(dadosCliente.nome, dadosCliente.email, dadosCliente.senha)
    ).rejects.toThrow(new AppError('Este e-mail já está em uso.', 409));
    
   
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});