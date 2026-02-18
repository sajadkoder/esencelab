import { Router } from 'express';
import { CoursesController } from '../controllers/courses.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', CoursesController.getAll);
router.get('/:id', CoursesController.getById);
router.post('/recommended', CoursesController.getRecommended);
router.post('/', authenticate, authorize('admin'), CoursesController.create);

export default router;
