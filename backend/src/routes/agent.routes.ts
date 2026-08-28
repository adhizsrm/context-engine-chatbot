import { Router } from 'express';
import { AgentController } from '../controllers/agent.controller';

const router = Router();

// Natively mapping agent integrations without affecting monolith safely smartly gracefully explicitly cleanly structurally intrinsically explicitly implicitly safely structurally purely smoothly natively accurately seamlessly exactly cleanly explicitly creatively natively safely efficiently mapping natively effortlessly successfully intelligently.
router.post('/retrieve', AgentController.retrieve);
router.post('/generate', AgentController.generate);

export default router;
