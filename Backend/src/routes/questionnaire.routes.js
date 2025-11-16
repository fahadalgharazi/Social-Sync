import { Router } from 'express';
import authGuard from '../middlewares/auth.js';
import * as Questionnaire from '../services/questionnaire.service.js';

const router = Router();
router.post('/submit', authGuard, Questionnaire.submit);
export default router;
