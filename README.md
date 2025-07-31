API - Agendamento de Barbearia
💡 A Ideia do Projeto
O projeto API - Agendamento de Barbearia é um backend robusto desenhado para ser o cérebro de um sistema completo de agendamento online. A ideia central é modernizar e simplificar a forma como clientes marcam horários em barbearias, eliminando a necessidade de ligações telefônicas e trocas de mensagens.

A plataforma conecta dois tipos de usuários:

Barbeiros: Que podem gerenciar seus próprios perfis, cadastrar seus horários de trabalho disponíveis e visualizar sua agenda de agendamentos.

Clientes: Que podem encontrar horários livres, agendar um serviço de forma rápida e exclusiva, e cancelar o agendamento caso necessário.

Este backend foi construído para ser uma API RESTful, servindo dados de forma segura e eficiente para qualquer tipo de frontend (seja uma aplicação web em React, um aplicativo móvel em React Native/Flutter, etc.).

✨ Funcionalidades Principais
Autenticação Segura: Sistema de registro e login com senhas criptografadas (bcryptjs) e autenticação baseada em Tokens JWT (JSON Web Tokens).

Gerenciamento de Usuários: Rotas distintas para o cadastro de clientes e a gestão de perfis de barbeiros.

Controle de Acesso por Papel: Middlewares que garantem que apenas barbeiros possam criar horários e apenas clientes possam fazer agendamentos.

Gestão de Disponibilidade: Barbeiros podem criar e deletar "slots" de horários disponíveis em sua agenda.

Agendamento Atômico: Clientes podem visualizar horários livres e agendá-los. O sistema utiliza transações de banco de dados para garantir que um mesmo horário não seja agendado por duas pessoas ao mesmo tempo.

Cancelamento de Agendamentos: Clientes (e barbeiros) podem cancelar agendamentos, tornando o horário disponível novamente.

🛠️ Arquitetura e Tecnologias Utilizadas
Este projeto foi desenvolvido com uma arquitetura em camadas para garantir a separação de responsabilidades, facilitando a manutenção e a escalabilidade.

Node.js: Ambiente de execução JavaScript no servidor.

Express.js: Framework web para a criação das rotas e gerenciamento das requisições HTTP.

PostgreSQL: Banco de dados relacional robusto e confiável para o armazenamento dos dados.

Prisma: ORM (Object-Relational Mapper) de última geração que facilita a interação com o banco de dados, define os modelos e gerencia as migrações de schema.

JWT (JSON Web Tokens): Para a criação de sessões de usuário seguras e sem estado (stateless).

CORS: Configurado para permitir requisições de um frontend separado (ex: http://localhost:3000).

A lógica é dividida em:

Rotas (/routes): Definem os endpoints da API.

Controladores (/controllers): Recebem as requisições, validam os dados de entrada e enviam a resposta.

Serviços (/services): Contêm toda a lógica de negócio e as regras da aplicação.

Modelos (definidos no schema.prisma): Representam a estrutura das tabelas do banco de dados.

⚙️ Pré-requisitos
Antes de começar, garanta que você tem as seguintes ferramentas instaladas em sua máquina:

Node.js (versão 18.x ou superior)

npm ou Yarn

Um servidor de banco de dados PostgreSQL rodando localmente ou na nuvem.

Git
