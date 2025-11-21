import { Router } from 'express';
import * as manuscriptController from '../controllers/manuscriptController.js';
import { AuthRequest, adminOnly, requireAuth } from '../middleware/auth.js';

import * as annotationController from '../controllers/annotationController.js';

const router = Router();

// Public routes
router.get('/', manuscriptController.getAllManuscripts);
router.get('/categories', manuscriptController.getCategories);
router.get('/languages', manuscriptController.getLanguages);
router.get('/:id', manuscriptController.getManuscriptById);
router.get('/:manuscriptId/annotations', annotationController.getAnnotations);

// Re-run OCR for a manuscript (owner or admin)
router.post('/:id/ocr', requireAuth, manuscriptController.reRunOcr);

// Protected routes (require authentication)
router.post('/', requireAuth, manuscriptController.createManuscript);
router.put('/:id', requireAuth, manuscriptController.updateManuscript);
router.delete('/:id', requireAuth, manuscriptController.deleteManuscript);
router.post('/:manuscriptId/annotations', requireAuth, annotationController.createAnnotation);

export default router;
