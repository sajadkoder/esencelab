import { Router } from 'express';
import { CandidatesController } from '../controllers/candidates.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, authorize('employer', 'admin'), CandidatesController.getAll);
router.get('/me', authenticate, CandidatesController.getProfile);
router.get('/search', authenticate, authorize('employer', 'admin'), CandidatesController.search);
router.get('/:id', authenticate, CandidatesController.getById);
router.post('/', authenticate, CandidatesController.create);
router.put('/me', authenticate, CandidatesController.updateProfile);
router.put('/:id/status', authenticate, authorize('employer', 'admin'), CandidatesController.updateStatus);

export default router;
