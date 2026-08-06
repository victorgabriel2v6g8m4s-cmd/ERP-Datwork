import { type Request, type Response } from 'express';
import crypto from 'crypto';
import { sanitizeFileName } from './fileSanitizer.js'; // ✨ Importa o higienizador

const APP_URL = process.env.APP_URL || 'http://localhost:3333';

export function handleMediaUpload(req: Request, res: Response) {
    if (!req.file) {
        return res.status(400).json({ error: 'Upload falhou ou arquivo não enviado.' });
    }

    // 🔄 BYPASS DE USUÁRIO: Altere para obter do 'req.user_id' quando JWT estiver ativo
    const currentUserId = 'default_user';

    // ✨ Higieniza o nome original usando o nosso utilitário padrão UTF-8
    const cleanOriginalName = sanitizeFileName(req.file.originalname);

    // Identifica dinamicamente o tipo de arquivo
    let fileType: 'image' | 'video' | 'document' = 'document';
    if (req.file.mimetype.startsWith('image/')) fileType = 'image';
    if (req.file.mimetype.startsWith('video/')) fileType = 'video';

    return res.status(200).json({
        id: crypto.randomUUID(),
        name: cleanOriginalName,
        // ✨ A URL mantém a estrutura por usuário que você planejou!
        url: `${APP_URL}/files/${currentUserId}/${req.file.filename}`,
        type: fileType,
    });
}
