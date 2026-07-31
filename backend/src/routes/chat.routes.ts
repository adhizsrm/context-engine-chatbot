import { Router } from 'express';
import { chatController } from '../composition/chat.module';

const router = Router();

// Process RAG generative workflow securely targeting native models.
router.post('/', chatController.ask);

export default router;
