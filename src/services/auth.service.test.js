// Importar o serviço que queremos testar
const authService = require('./auth.service');
// Importar o AppError para checar os erros
const AppError = require('../utils/AppError');
// Importar o cliente Prisma para que possamos "mocká-lo"
const prisma = require('../database/prisma');

// Informa ao Jest: "Sempre que o prisma for importado neste arquivo de teste,
// substitua-o por uma versão 'mockada' (falsa)".
jest.mock('../database/prisma');

// `describe` agrupa testes relacionados
describe('Auth Service', () => {

  // Limpa todos os mocks depois de cada teste para garantir que um teste não interfira no outro
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Teste do "Caminho Feliz" ---
  it('deve ser capaz de registrar um novo cliente com sucesso', async () => {
    // 1. ARRANGE (Organizar)
    // Dados de entrada para o teste
    const dadosCliente = {
      nome: 'Cliente Teste',
      email: 'teste@email.com',
      senha: '123',
    };

    // Instruímos nosso Prisma falso sobre como se comportar:
    // Quando `prisma.user.findUnique` for chamado, ele deve retornar `null` (simulando que o email não existe).
    prisma.user.findUnique.mockResolvedValue(null);
    // Quando `prisma.user.create` for chamado, ele deve retornar o objeto do novo cliente.
    prisma.user.create.mockResolvedValue({
      id: 1,
      ...dadosCliente,
      tipo: 'CLIENTE',
    });

    // 2. ACT (Agir)
    // Executamos a função que estamos testando
    const novoCliente = await authService.registrarCliente(
      dadosCliente.nome,
      dadosCliente.email,
      dadosCliente.senha
    );

    // 3. ASSERT (Verificar)
    // Verificamos se o resultado é o esperado
    expect(novoCliente).toBeDefined(); // O resultado não deve ser nulo
    expect(novoCliente.id).toBe(1); // O ID deve ser o que definimos no mock
    expect(novoCliente.email).toBe(dadosCliente.email); // O email deve ser o mesmo da entrada
    // Verificamos se a função `create` do Prisma foi chamada com os dados corretos (exceto a senha, que é hasheada)
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: dadosCliente.email })
    );
  });

  // --- Teste de um Cenário de Erro ---
  it('deve lançar um erro se o e-mail já estiver em uso', async () => {
    // 1. ARRANGE
    const dadosCliente = {
      nome: 'Cliente Teste',
      email: 'existente@email.com',
      senha: '123',
    };
    
    // Agora, simulamos que o e-mail JÁ EXISTE no banco de dados
    prisma.user.findUnique.mockResolvedValue({
      id: 2,
      email: 'existente@email.com',
      nome: 'Outro Cliente',
    });

    // 2. ACT & 3. ASSERT
    // Esperamos que a chamada da função REJEITE (lance um erro)
    // e que o erro seja uma instância da nossa classe AppError com a mensagem correta.
    await expect(
      authService.registrarCliente(dadosCliente.nome, dadosCliente.email, dadosCliente.senha)
    ).rejects.toThrow(new AppError('Este e-mail já está em uso.', 409));
    
    // Também verificamos que, neste caso, a função `create` NUNCA foi chamada
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});