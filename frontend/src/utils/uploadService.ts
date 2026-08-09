import { api } from '../api/client.ts';
import { CustomLogger } from './CustomLogger.ts';

/**
 * Envia um arquivo físico de mídia para o serviço unificado de uploads do backend
 * @returns String contendo a URL pública de acesso ao arquivo gravado em disco
 */
export async function executeBinaryUpload(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append('file', file);

    CustomLogger.info(`[Upload Service] Iniciando transmissão multipart/form-data para: ${file.name}`);

    try {
        const response = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        CustomLogger.info('[Upload Service] Transmissão finalizada com sucesso absoluto.');
        return response.data.url;
    } catch (error) {
        CustomLogger.error(`[Upload Service] Falha crítica na gravação do arquivo ${file.name}`, error);
        return null;
    }
}
