// Backend/src/validators/questionnaire.validator.js
import { z } from 'zod';

const likertAnswerSchema = z
  .coerce
  .number()
  .int('Answer must be a whole number')
  .min(1, 'Answer must be between 1 and 5')
  .max(5, 'Answer must be between 1 and 5');

/**
 * Schema for a trait's answers (exactly 3 answers)
 *
 * .length(3) ensures exactly 3 answers per trait.
 * This prevents incomplete questionnaires.
 */
const traitAnswersSchema = z
  .array(likertAnswerSchema)
  .length(3, 'Each trait must have exactly 3 answers');

/**
 * Main questionnaire submission schema
 *
 * LESSON: Nested Object Validation
 * z.object() can be nested to validate complex structures.
 * Each level gets its own validation rules.
 */
export const questionnaireSchema = z.object({
  answers: z.object({
    Extraversion: traitAnswersSchema,
    'Emotional Stability': traitAnswersSchema,
    Agreeableness: traitAnswersSchema,
    Conscientiousness: traitAnswersSchema,
    Openness: traitAnswersSchema,
  }, {
    required_error: 'Answers are required',
    invalid_type_error: 'Answers must be an object'
  }),

  openEnded: z
    .string()
    .max(2000, 'Open-ended response must be 2000 characters or less')
    .optional()
    .default('')
});