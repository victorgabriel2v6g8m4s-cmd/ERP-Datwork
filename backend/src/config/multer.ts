import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import {
  SERVER_CONFIG,
  type AllowedUploadMimeType
} from './serverConfig.js';
import { CustomLogger } from '../logger/CustomLogger.js';
import { sanitizeFileName } from '../utils/fileSanitizer.js';
import { getSafeUploadExtension } from '../utils/uploadSecurity.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const baseUploadFolder = path.resolve(currentDirectory, '..', '..', 'uploads');

function isAllowedMimeType(value: string): value is AllowedUploadMimeType {
  return SERVER_CONFIG.uploads.allowedMimeTypes.some((mimeType) => mimeType === value);
}

export const upload = multer({
  limits: {
    fileSize: SERVER_CONFIG.uploads.maxSizeBytes,
    files: 1,
    fields: 2
  },
  fileFilter: (_req, file, callback) => {
    if (!isAllowedMimeType(file.mimetype)) {
      callback(new Error('UnsupportedUploadMimeType'));
      return;
    }
    callback(null, true);
  },
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => {
      const currentUserId = 'default_user';
      const userFolder = path.resolve(baseUploadFolder, currentUserId);

      if (!fs.existsSync(userFolder)) {
        CustomLogger.info(`[Uploads] Creating isolated directory for ${currentUserId}`);
        fs.mkdirSync(userFolder, { recursive: true });
      }

      callback(null, userFolder);
    },
    filename: (_req, file, callback) => {
      if (!isAllowedMimeType(file.mimetype)) {
        callback(new Error('UnsupportedUploadMimeType'), '');
        return;
      }

      const fileHash = crypto.randomBytes(16).toString('hex');
      const cleanName = sanitizeFileName(file.originalname);
      const baseName = path.basename(cleanName, path.extname(cleanName));
      callback(null, `${fileHash}-${baseName}${getSafeUploadExtension(file.mimetype)}`);
    }
  })
});
