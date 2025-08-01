const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');


const dbFilePath = path.resolve(__dirname, '..', '..', 'database.db');

let dbInstance = null;

/**
 * Conecta ao banco de dados SQLite e cria as tabelas se não existirem.
 * Utiliza um padrão Singleton para garantir que haja apenas uma conexão aberta.
 * @returns {Promise<Database>} A instância do banco de dados.
 */
async function connect() {
    if (dbInstance) {
        return dbInstance;
    }

    try {
        const db = await open({
            filename: dbFilePath,
            driver: sqlite3.Database
        });

        console.log('✅ Conectado ao banco de dados SQLite.');

       
        await db.exec('PRAGMA foreign_keys = ON;');

        await runSchema(db);

        dbInstance = db;
        return dbInstance;

    } catch (error) {
        console.error('❌ Erro ao conectar ou configurar o banco de dados SQLite:', error);
        
        process.exit(1);
    }
}

/**
 * Executa o script SQL para criar as tabelas da aplicação.
 * @param {Database} db - A instância do banco de dados.
 */
async function runSchema(db) {
   
    const schemaSQL = `
        CREATE TABLE IF NOT EXISTS User (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL,
            tipo TEXT CHECK(tipo IN ('CLIENTE', 'BARBEIRO')) NOT NULL,
            createdAt TEXT DEFAULT (datetime('now','localtime')),
            updatedAt TEXT DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS Horario (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data_hora_inicio TEXT NOT NULL,
            data_hora_fim TEXT NOT NULL,
            status TEXT DEFAULT 'disponivel',
            barbeiroId INTEGER NOT NULL,
            createdAt TEXT DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (barbeiroId) REFERENCES User(id)
        );

        CREATE TABLE IF NOT EXISTS Agendamento (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            status TEXT DEFAULT 'confirmado',
            clienteId INTEGER NOT NULL,
            horarioId INTEGER NOT NULL UNIQUE,
            createdAt TEXT DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (clienteId) REFERENCES User(id),
            FOREIGN KEY (horarioId) REFERENCES Horario(id) ON DELETE CASCADE
        );
      `;

    console.log('📝 Executando schema do banco de dados...');
    await db.exec(schemaSQL);
    console.log('✅ Schema executado com sucesso.');
}

module.exports = { connect };