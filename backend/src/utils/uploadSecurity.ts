import { open } from 'node:fs/promises';
import type { AllowedUploadMimeType } from '../config/serverConfig.js';

const EXTENSION_BY_MIME: Record<AllowedUploadMimeType, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'application/pdf': '.pdf'
};

export function getSafeUploadExtension(mimeType: AllowedUploadMimeType): string {
  return EXTENSION_BY_MIME[mimeType];
}

export async function detectUploadMimeType(filePath: string): Promise<AllowedUploadMimeType | null> {
  const file = await open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(16);
    const { bytesRead } = await file.read(buffer, 0, buffer.length, 0);
    const bytes = buffer.subarray(0, bytesRead);

    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
    if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
    if (bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
    if (bytes.length >= 8 && bytes.subarray(4, 8).toString('ascii') === 'ftyp') return 'video/mp4';
    if (bytes.length >= 4 && bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return 'video/webm';
    if (bytes.length >= 4 && bytes.subarray(0, 4).toString('ascii') === '%PDF') return 'application/pdf';
    return null;
  } finally {
    await file.close();
  }
}
