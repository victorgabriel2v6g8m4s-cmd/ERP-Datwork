import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// 🛡️ Extrai o caminho limpando o prefixo "file:" exigido pelo SQLite (ex: "./prisma/dev.db")
const dbPath = (process.env['DATABASE_URL'] || 'file:./prisma/dev.db').replace('file:', '');

// 🔮 O construtor do Prisma 7 espera um objeto com a propriedade 'url' contendo o caminho do arquivo
const adapter = new PrismaBetterSqlite3({
  url: dbPath
});

// ✨ Cria o cliente injetando o adaptador. Isso resolve o erro de tipagem ts(2345)!
const prismaClient = new PrismaClient({ adapter });

export default prismaClient;
