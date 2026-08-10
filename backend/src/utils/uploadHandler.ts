import crypto from 'node:crypto';
import { unlink } from 'node:fs/promises';
import type { Request, Response } from 'express';
import {
  SERVER_CONFIG,
  type AllowedUploadMimeType
} from '../config/serverConfig.js';
import { CustomLogger } from '../logger/CustomLogger.js';
import { sanitizeFileName } from './fileSanitizer.js';
import { detectUploadMimeType } from './uploadSecurity.js';

function toMediaType(mimeType: AllowedUploadMimeType): 'image' | 'video' | 'document' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'document';
}

export async function handleMediaUpload(req: Request, res: Response): Promise<Response> {
  if (!req.file) {
    return res.status(400).json({ error: 'Upload falhou ou arquivo não enviado.' });
  }

  const detectedMimeType = await detectUploadMimeType(req.file.path);
  if (!detectedMimeType || detectedMimeType !== req.file.mimetype) {
    await unlink(req.file.path).catch((error: unknown) => {
      CustomLogger.error('[Uploads] Failed to remove rejected upload', error);
    });
    CustomLogger.warn('[Uploads] Rejected file with mismatched or unsupported signature', {
      declaredMimeType: req.file.mimetype,
      detectedMimeType
    });
    return res.status(415).json({ error: 'O conteúdo do arquivo não corresponde a um formato permitido.' });
  }

  const currentUserId = 'default_user';
  const relativeUrl = `/files/${currentUserId}/${req.file.filename}`;
  const publicUrl = SERVER_CONFIG.uploads.publicBaseUrl
    ? `${SERVER_CONFIG.uploads.publicBaseUrl}${relativeUrl}`
    : relativeUrl;

  return res.status(200).json({
    id: crypto.randomUUID(),
    name: sanitizeFileName(req.file.originalname),
    url: publicUrl,
    type: toMediaType(detectedMimeType)
  });
}
