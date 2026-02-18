import { Router } from 'express';
import authRoutes from './auth.routes.js';
import jobsRoutes from './jobs.routes.js';
import candidatesRoutes from './candidates.routes.js';
import applicationsRoutes from './applications.routes.js';
import coursesRoutes from './courses.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/jobs', jobsRoutes);
router.use('/candidates', candidatesRoutes);
router.use('/applications', applicationsRoutes);
router.use('/courses', coursesRoutes);

export default router;
