import { Router } from 'express';
import {
  getAnalyticsSummary,
  getHeatmap,
  getPages,
  getSessionEvents,
  getSessions
} from '../controllers/analyticsController.js';

const router = Router();

router.get('/sessions', getSessions);
router.get('/sessions/:sessionId/events', getSessionEvents);
router.get('/heatmap', getHeatmap);
router.get('/pages', getPages);
router.get('/analytics/summary', getAnalyticsSummary);

export default router;
