// Backend/src/validators/questionnaire.validator.js
import { z } from 'zod';

/**
 * LESSON: Complex Object Validation
 *
 * The questionnaire has a specific structure:
 * {
 *   answers: {
 *     Extraversion: [1, 2, 3],           // 3 answers, each 1-5
 *     "Emotional Stability": [4, 5, 3],  // 3 answers, each 1-5
 *     ...etc
 *   },
 *   openEnded: "optional text response"
 * }
 *
 * This is more complex than simple string validation, but Zod handles it beautifully!
 */

/**
 * Schema for a single answer (1-5 Likert scale)
 *
 * LESSON: .coerce
 * Form data often comes as strings ("3" instead of 3).
 * z.coerce.number() converts "3" → 3 before validation.
 * This is safer than manually parsing everywhere.
 */
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

/**
 * WHAT THIS VALIDATION CATCHES:
 *
 * 1. Missing traits: { Extraversion: [1,2,3] } - fails, missing other traits
 * 2. Wrong number of answers: { Extraversion: [1,2] } - fails, needs 3
 * 3. Out of range: { Extraversion: [1,6,3] } - fails, 6 > 5
 * 4. Invalid type: { Extraversion: ["yes", 2, 3] } - coerces if possible, else fails
 * 5. Too long open-ended: (2001 chars) - fails
 *
 * All these edge cases are handled by 20 lines of schema definition
 * instead of 100+ lines of manual if/else checks!
 */
