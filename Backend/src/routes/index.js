import { Router } from 'express';
import eventsRouter from './events.routes.js';
import questionnaireRouter from './questionnaire.routes.js';
import authRouter from './auth.routes.js';
import friendsRouter from './friends.routes.js';
import userEventsRouter from './userEvents.routes.js';
import groupsRouter from './groups.routes.js';
import usersRouter from './users.routes.js';
import authGuard from '../middlewares/auth.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/events', authGuard, eventsRouter);
router.use('/questionnaire', authGuard, questionnaireRouter);
router.use('/friends', authGuard, friendsRouter);
router.use('/user-events', authGuard, userEventsRouter);
router.use('/groups', authGuard, groupsRouter);
router.use('/users', authGuard, usersRouter);
export default router;
