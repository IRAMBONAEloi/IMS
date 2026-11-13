import multer, { type FileFilterCallback } from 'multer';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';

const extensionsByMimeType: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
};

export function getUploadDirectory() {
  const directory = process.env.UPLOAD_DIR || path.join(process.cwd(), 'src', 'uploads');
  mkdirSync(directory, { recursive: true });
  return directory;
}

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, getUploadDirectory()),
  filename: (_request, file, callback) => {
    callback(null, `${randomUUID()}${extensionsByMimeType[file.mimetype] ?? '.bin'}`);
  },
});

const fileFilter = (_request: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
  if (extensionsByMimeType[file.mimetype]) {
    callback(null, true);
    return;
  }

  callback(new Error('Only JPEG, PNG, WEBP, and AVIF images are allowed.'));
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
