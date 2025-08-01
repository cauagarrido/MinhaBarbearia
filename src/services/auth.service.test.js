// Importar o serviço que queremos testar
const authService = require('./auth.service');
// Importar o módulo de conexão para que possamos mocká-lo
const { connect } = require('../database/sqlite');
// Importar o AppError para verificar os erros
const AppError = require('../utils/AppError');

// Diz ao Jest: "Sempre que o código pedir por '../database/sqlite',
// entregue uma versão falsa (mock) em vez da real."
jest.mock('../database/sqlite');

describe('Auth Service (Unit Tests)', () => {
  let mockDb;

  // Antes de cada teste, criamos um objeto de banco de dados falso
  beforeEach(() => {
    mockDb = {
      get: jest.fn(), // Mock da função 'get'
      run: jest.fn(), // Mock da função 'run'
    };
    // Configuramos o mock da função 'connect' para retornar nosso DB falso
    connect.mockResolvedValue(mockDb);
  });

  // Limpa os mocks após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve registrar um novo cliente com sucesso', async () => {
    // Arrange: Preparamos o cenário
    const nome = 'Teste';
    const email = 'teste@email.com';
    const senha = '123';

    // Dizemos como nosso DB falso deve se comportar para este teste:
    mockDb.get.mockResolvedValue(null); // Simula que o email não existe
    mockDb.run.mockResolvedValue({ lastID: 1 }); // Simula uma inserção bem-sucedida

    // Act: Executamos a função
    const result = await authService.registrarCliente(nome, email, senha);

    // Assert: Verificamos o resultado
    expect(result.id).toBe(1);
    expect(result.email).toBe(email);
    expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM User WHERE email = ?', [email]);
  });

  it('deve lançar um erro se o e-mail já estiver em uso', async () => {
    // Arrange
    const nome = 'Teste';
    const email = 'existente@email.com';
    const senha = '123';

    // Simula que o email JÁ existe no banco
    mockDb.get.mockResolvedValue({ id: 1, email: 'existente@email.com' });

    // Act & Assert
    // Esperamos que a chamada da função seja rejeitada com o erro correto
    await expect(
      authService.registrarCliente(nome, email, senha)
    ).rejects.toThrow(new AppError('Este e-mail já está em uso.', 409));

    // Verificamos que a função de inserção NUNCA foi chamada
    expect(mockDb.run).not.toHaveBeenCalled();
  });
});