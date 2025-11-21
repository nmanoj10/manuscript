import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Configure multer for in-memory storage
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  // Allow images and PDFs
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

export const generateUniqueFileName = (originalName: string): string => {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  return `${name}-${uuidv4()}${ext}`;
};
