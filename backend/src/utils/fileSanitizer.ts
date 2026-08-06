import path from 'path';
import { CustomLogger } from '../logger/CustomLogger.js';

export function sanitizeFileName(originalName: string): string {
    try {
        CustomLogger.info(`[Sanitizer] Nome original recebido bruto: "${originalName}"`);

        // 1. Corrige o encoding de ISO-8859-1 para UTF-8 real de forma segura
        let utf8Name = originalName;
        try {
            utf8Name = Buffer.from(originalName, 'latin1').toString('utf8');
            CustomLogger.info(`[Sanitizer] Nome convertido para UTF-8: "${utf8Name}"`);
        } catch (e: any) {
            CustomLogger.warn(`[Sanitizer] Falha ao converter encoding, usando fallback original: ${e.message}`);
        }

        const ext = path.extname(utf8Name);
        const baseName = path.basename(utf8Name, ext);

        // 2. Remove acentos
        const normalized = baseName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // 3. Limpa caracteres especiais e espaços
        let cleanName = normalized
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-_]/g, '');

        CustomLogger.info(`[Sanitizer] Nome após limpeza de acentos e Regex: "${cleanName}"`);

        if (cleanName.length > 30) {
            cleanName = cleanName.substring(0, 30);
        }

        if (!cleanName) {
            cleanName = 'arquivo-upload';
        }

        const finalResult = `${cleanName}${ext.toLowerCase()}`;
        CustomLogger.info(`[Sanitizer] String final tratada com sucesso: "${finalResult}"`);

        return finalResult;
    } catch (err: any) {
        CustomLogger.error('[Sanitizer] Erro crítico inesperado dentro do higienizador', err);
        // Fallback absoluto para nunca travar o callback do Multer
        return `upload-fallback-${Date.now()}${path.extname(originalName).toLowerCase()}`;
    }
}
