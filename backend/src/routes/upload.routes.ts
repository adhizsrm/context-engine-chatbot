import { Router } from 'express';
import { uploadDocument } from '../controllers/upload.controller';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();

// POST /api/upload -> expecting form-data with key 'document'
router.post('/', uploadMiddleware.single('document'), uploadDocument);

export default router;
