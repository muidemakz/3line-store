import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/AppError';

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

/**
 * Disk storage — files saved to /uploads with a unique timestamped filename.
 */
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

/**
 * Memory storage — for services that process the buffer before uploading
 * to an external cloud (Cloudinary, S3, etc.)
 */
const memoryStorage = multer.memoryStorage();

const imageFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed (jpg, png, gif, webp).', 400), false);
  }
};

const limits = { fileSize: 5 * 1024 * 1024 }; // 5 MB

/** Saves file to local /uploads folder. Use for the general upload endpoint. */
export const upload = multer({ storage: diskStorage, fileFilter: imageFilter, limits });

/** Keeps file in memory. Use when forwarding to a cloud provider. */
export const uploadMemory = multer({ storage: memoryStorage, fileFilter: imageFilter, limits });

export { UPLOADS_DIR };
