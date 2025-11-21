import { Router } from 'express';
import * as uploadController from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Upload endpoint (requires authentication)
router.post('/', requireAuth, upload.single('file'), uploadController.uploadManuscript);

// Get upload status (requires authentication)
router.get('/status/:uploadId', requireAuth, uploadController.getUploadStatus);

// Get user uploads (requires authentication)
router.get('/user/uploads', requireAuth, uploadController.getUserUploads);

export default router;
