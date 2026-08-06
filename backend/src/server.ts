import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { router } from './routes.js';
import { CustomLogger } from './logger/CustomLogger.js';

// ✨ Configuração necessária para resolver caminhos absolutos no padrão ESM (Node.js 20+)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env['PORT'] || 3333;

// Middleware global de segurança e tratamento de dados
app.use(cors());
app.use(express.json());

// 🖼️ Servidor de Arquivos Estáticos
// Aponta para a raiz 'uploads', permitindo que rotas como /files/default_user/imagem.jpg funcionem nativamente!
app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads')));

// Injeção do arquivo modular de rotas global
app.use(router);

// 🛡️ Middleware global de captura de erros (Evita que o Node caia por unhandled exceptions)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  CustomLogger.error(`Erro não tratado detectado na requisição ${req.method} ${req.url}`, err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});

// Inicialização do escopo do servidor ERP
app.listen(PORT, () => {
  CustomLogger.info(`🔮 Agenda Mágica Backend rodando com sucesso absoluto na porta ${PORT}`);
});
