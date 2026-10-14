import { Router } from 'express';
import { ingestEvent } from '../controllers/eventController.js';

const router = Router();

router.post('/', ingestEvent);

export default router;
