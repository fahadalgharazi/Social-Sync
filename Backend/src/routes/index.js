import { Router } from 'express';
import eventsRouter from './events.routes.js';
import authRouter from './auth.routes.js';
import authGuard from '../middlewares/auth.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/events', authGuard, eventsRouter);

export default router;
