import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sanitizeFileName } from '../utils/fileSanitizer.js';
import { CustomLogger } from '../logger/CustomLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pasta base raiz
const baseUploadFolder = path.resolve(__dirname, '..', '..', 'uploads');

export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // 🔄 Puxa o usuário atual (futuramente req.user_id do JWT)
      const currentUserId = 'default_user';

      // ✨ Define o caminho final isolado por usuário: uploads/default_user
      const userFolder = path.resolve(baseUploadFolder, currentUserId);

      // ✨ Cria a pasta do usuário em tempo de execução se ela não existir!
      if (!fs.existsSync(userFolder)) {
        CustomLogger.info(`[Multer] Criando subpasta isolada para o usuário: ${currentUserId}`);
        fs.mkdirSync(userFolder, { recursive: true });
      }

      cb(null, userFolder);
    },
    filename: (req, file, cb) => {
      const fileHash = crypto.randomBytes(8).toString('hex');
      const cleanName = sanitizeFileName(file.originalname);
      cb(null, `${fileHash}-${cleanName}`);
    }
  })
});
