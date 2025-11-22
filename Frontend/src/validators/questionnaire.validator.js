import { z } from 'zod';

const likertAnswerSchema = z
  .number({ required_error: 'Please answer this question' })
  .int('Answer must be a whole number')
  .min(1, 'Answer must be between 1 and 5')
  .max(5, 'Answer must be between 1 and 5');

const traitAnswersSchema = z
  .array(likertAnswerSchema)
  .length(3, 'Each trait must have exactly 3 answers');

/**
 * Questionnaire submission schema
 * Validates all Big Five trait answers + optional open-ended response
 */
export const questionnaireSchema = z.object({
  answers: z.object({
    Extraversion: traitAnswersSchema,
    'Emotional Stability': traitAnswersSchema,
    Agreeableness: traitAnswersSchema,
    Conscientiousness: traitAnswersSchema,
    Openness: traitAnswersSchema,
  }, {
    required_error: 'All questions must be answered',
    invalid_type_error: 'Invalid questionnaire format'
  }),

  openEnded: z
    .string()
    .max(2000, 'Response must be 2000 characters or less')
    .optional()
    .default('')
});