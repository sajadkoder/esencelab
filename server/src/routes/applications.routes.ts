import { Router } from 'express';
import { ApplicationsController } from '../controllers/applications.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/user', authenticate, ApplicationsController.getUserApplications);
router.post('/', authenticate, ApplicationsController.apply);
router.put('/:id/status', authenticate, authorize('employer', 'admin'), ApplicationsController.updateStatus);
router.delete('/:id', authenticate, ApplicationsController.delete);

export default router;
