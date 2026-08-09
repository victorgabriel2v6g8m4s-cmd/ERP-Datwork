import { api } from '../api/client.ts';
import { type MediaItem } from '../types/media.ts';
import { CustomLogger } from './CustomLogger.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeUploadedMedia(value: unknown): MediaItem | null {
    if (!isRecord(value)) return null;

    const id = typeof value.id === 'string' ? value.id.trim() : '';
    const name = typeof value.name === 'string' ? value.name.trim() : '';
    const url = typeof value.url === 'string' ? value.url.trim() : '';
    const type = value.type;

    if (!id || !name || !url || (type !== 'image' && type !== 'video' && type !== 'document')) {
        return null;
    }

    return { id, name, url, type };
}

export async function uploadMedia(file: File, endpoint: string): Promise<MediaItem | null> {
    const formData = new FormData();
    formData.append('file', file);

    CustomLogger.info(`[Upload Service] Starting upload to ${endpoint}`, {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
    });

    try {
        const response = await api.post<unknown>(endpoint, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        const media = normalizeUploadedMedia(response.data);
        if (!media) {
            CustomLogger.error(`[Upload Service] Invalid upload response received from ${endpoint}`);
            return null;
        }

        CustomLogger.info(`[Upload Service] Upload completed successfully to ${endpoint}`, {
            mediaId: media.id,
            mediaType: media.type
        });

        return media;
    } catch (error) {
        CustomLogger.error(`[Upload Service] Failed to upload ${file.name} to ${endpoint}`, error);
        return null;
    }
}

/**
 * Compatibility wrapper for legacy callers that only need the public URL.
 * New code should prefer uploadMedia so response validation is preserved.
 */
export async function executeBinaryUpload(file: File): Promise<string | null> {
    const media = await uploadMedia(file, '/upload');
    return media?.url ?? null;
}
