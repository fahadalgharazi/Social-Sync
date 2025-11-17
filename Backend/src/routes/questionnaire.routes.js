import { Router } from 'express';
import authGuard from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { questionnaireSchema } from '../validators/questionnaire.validator.js';
import * as Questionnaire from '../services/questionnaire.service.js';

const router = Router();

/**
 * POST /api/questionnaire/submit
 *
 * Middleware chain:
 * 1. authGuard - Ensures user is logged in
 * 2. validate(questionnaireSchema) - Validates all 15 answers are 1-5
 * 3. Questionnaire.submit - Calculates personality type
 *
 * LESSON: Middleware Order Matters!
 * We check auth BEFORE validation because:
 * - No point validating if user isn't logged in
 * - Saves server resources
 * - Security-first approach
 */
router.post('/submit', authGuard, validate(questionnaireSchema), Questionnaire.submit);

export default router;