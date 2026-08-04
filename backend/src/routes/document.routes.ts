import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';

const router = Router();

router.get('/', DocumentController.getDocuments);
router.delete('/:id', DocumentController.deleteDocument);

export default router;
