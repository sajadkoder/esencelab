import { Router } from 'express';
import { JobsController } from '../controllers/jobs.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', JobsController.getAll);
router.get('/employer', authenticate, authorize('employer'), JobsController.getByEmployer);
router.get('/:id', JobsController.getById);
router.post('/', authenticate, authorize('employer'), JobsController.create);
router.put('/:id', authenticate, authorize('employer'), JobsController.update);
router.delete('/:id', authenticate, authorize('employer', 'admin'), JobsController.delete);

export default router;
