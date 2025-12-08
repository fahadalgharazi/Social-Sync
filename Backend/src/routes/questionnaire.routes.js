import { Router } from 'express';
import authGuard from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { questionnaireSchema } from '../validators/questionnaire.validator.js';
import * as Questionnaire from '../services/questionnaire.service.js';

const router = Router();

router.post('/submit', authGuard, validate(questionnaireSchema), Questionnaire.submit);

export default router;