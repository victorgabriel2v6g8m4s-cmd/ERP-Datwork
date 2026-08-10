import path from 'path';
import { CustomLogger } from '../logger/CustomLogger.js';

export function sanitizeFileName(originalName: string): string {
    try {
        let utf8Name = originalName;
        try {
            utf8Name = Buffer.from(originalName, 'latin1').toString('utf8');
        } catch (error: unknown) {
            CustomLogger.warn('[Sanitizer] Encoding conversion failed; preserving original name', error);
        }

        const ext = path.extname(utf8Name);
        const baseName = path.basename(utf8Name, ext);

        const normalized = baseName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        let cleanName = normalized
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-_]/g, '');

        if (cleanName.length > 30) {
            cleanName = cleanName.substring(0, 30);
        }

        if (!cleanName) {
            cleanName = 'arquivo-upload';
        }

        return `${cleanName}${ext.toLowerCase()}`;
    } catch (error: unknown) {
        CustomLogger.error('[Sanitizer] Unexpected filename sanitization failure', error);
        return `upload-fallback-${Date.now()}${path.extname(originalName).toLowerCase()}`;
    }
}
