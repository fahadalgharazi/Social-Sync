/**
 * LESSON: Testing Nested Object Validators
 *
 * The questionnaire has nested data:
 * { answers: { Extraversion: [1,2,3], ... }, openEnded: "text" }
 *
 * We test:
 * 1. Valid nested structure
 * 2. Missing nested properties
 * 3. Invalid nested values
 */

import { describe, it, expect } from '@jest/globals';
import { questionnaireSchema } from '../../src/validators/questionnaire.validator.js';

describe('Questionnaire Validator', () => {
  /**
   * Helper function to create valid questionnaire data
   * This reduces duplication in tests
   */
  const createValidAnswers = () => ({
    Extraversion: [3, 4, 3],
    'Emotional Stability': [4, 3, 4],
    Agreeableness: [4, 4, 3],
    Conscientiousness: [3, 4, 4],
    Openness: [5, 4, 5]
  });

  describe('Valid Data (Happy Path)', () => {
    it('should accept valid questionnaire with all traits', () => {
      const validData = {
        answers: createValidAnswers(),
        openEnded: 'This is my response'
      };

      const result = questionnaireSchema.parse(validData);
      expect(result.answers).toBeDefined();
      expect(result.answers.Extraversion).toEqual([3, 4, 3]);
      expect(result.openEnded).toBe('This is my response');
    });

    it('should accept questionnaire without open-ended response', () => {
      const validData = {
        answers: createValidAnswers()
        // openEnded is optional
      };

      const result = questionnaireSchema.parse(validData);
      expect(result.openEnded).toBe(''); // Default empty string
    });

    it('should accept all answers at minimum value (1)', () => {
      const validData = {
        answers: {
          Extraversion: [1, 1, 1],
          'Emotional Stability': [1, 1, 1],
          Agreeableness: [1, 1, 1],
          Conscientiousness: [1, 1, 1],
          Openness: [1, 1, 1]
        }
      };

      const result = questionnaireSchema.parse(validData);
      expect(result.answers.Extraversion).toEqual([1, 1, 1]);
    });

    it('should accept all answers at maximum value (5)', () => {
      const validData = {
        answers: {
          Extraversion: [5, 5, 5],
          'Emotional Stability': [5, 5, 5],
          Agreeableness: [5, 5, 5],
          Conscientiousness: [5, 5, 5],
          Openness: [5, 5, 5]
        }
      };

      const result = questionnaireSchema.parse(validData);
      expect(result.answers.Openness).toEqual([5, 5, 5]);
    });
  });

  describe('Data Coercion', () => {
    it('should coerce string numbers to actual numbers', () => {
      // Form data often comes as strings
      const data = {
        answers: {
          Extraversion: ['3', '4', '3'], // Strings instead of numbers
          'Emotional Stability': ['4', '3', '4'],
          Agreeableness: ['4', '4', '3'],
          Conscientiousness: ['3', '4', '4'],
          Openness: ['5', '4', '5']
        }
      };

      const result = questionnaireSchema.parse(data);
      expect(result.answers.Extraversion).toEqual([3, 4, 3]); // Coerced to numbers
      expect(typeof result.answers.Extraversion[0]).toBe('number');
    });
  });

  describe('Missing Traits', () => {
    it('should reject missing Extraversion', () => {
      const invalidData = {
        answers: {
          // Extraversion missing!
          'Emotional Stability': [4, 3, 4],
          Agreeableness: [4, 4, 3],
          Conscientiousness: [3, 4, 4],
          Openness: [5, 4, 5]
        }
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });

    it('should reject missing Emotional Stability', () => {
      const invalidData = {
        answers: {
          Extraversion: [3, 4, 3],
          // 'Emotional Stability' missing!
          Agreeableness: [4, 4, 3],
          Conscientiousness: [3, 4, 4],
          Openness: [5, 4, 5]
        }
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });

    it('should reject completely missing answers object', () => {
      const invalidData = {
        openEnded: 'Response without answers'
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });
  });

  describe('Answer Array Length Validation', () => {
    it('should reject trait with only 2 answers', () => {
      const invalidData = {
        answers: {
          Extraversion: [3, 4], // Only 2! Need 3
          'Emotional Stability': [4, 3, 4],
          Agreeableness: [4, 4, 3],
          Conscientiousness: [3, 4, 4],
          Openness: [5, 4, 5]
        }
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });

    it('should reject trait with 4 answers', () => {
      const invalidData = {
        answers: {
          Extraversion: [3, 4, 3, 5], // 4 answers! Need exactly 3
          'Emotional Stability': [4, 3, 4],
          Agreeableness: [4, 4, 3],
          Conscientiousness: [3, 4, 4],
          Openness: [5, 4, 5]
        }
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty answer array', () => {
      const invalidData = {
        answers: {
          Extraversion: [], // Empty!
          'Emotional Stability': [4, 3, 4],
          Agreeableness: [4, 4, 3],
          Conscientiousness: [3, 4, 4],
          Openness: [5, 4, 5]
        }
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });
  });

  describe('Answer Value Range Validation', () => {
    it('should reject answer value of 0', () => {
      const invalidData = {
        answers: {
          Extraversion: [0, 3, 4], // 0 is below minimum!
          'Emotional Stability': [4, 3, 4],
          Agreeableness: [4, 4, 3],
          Conscientiousness: [3, 4, 4],
          Openness: [5, 4, 5]
        }
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });

    it('should reject answer value of 6', () => {
      const invalidData = {
        answers: {
          Extraversion: [3, 6, 4], // 6 is above maximum!
          'Emotional Stability': [4, 3, 4],
          Agreeableness: [4, 4, 3],
          Conscientiousness: [3, 4, 4],
          Openness: [5, 4, 5]
        }
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });

    it('should reject negative answer values', () => {
      const invalidData = {
        answers: {
          Extraversion: [3, -1, 4], // Negative!
          'Emotional Stability': [4, 3, 4],
          Agreeableness: [4, 4, 3],
          Conscientiousness: [3, 4, 4],
          Openness: [5, 4, 5]
        }
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });

    it('should reject decimal answer values', () => {
      const invalidData = {
        answers: {
          Extraversion: [3.5, 4, 3], // Decimal!
          'Emotional Stability': [4, 3, 4],
          Agreeableness: [4, 4, 3],
          Conscientiousness: [3, 4, 4],
          Openness: [5, 4, 5]
        }
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });
  });

  describe('Answer Type Validation', () => {
    it('should reject non-numeric answers', () => {
      const invalidData = {
        answers: {
          Extraversion: ['yes', 'no', 'maybe'], // Strings that aren't numbers
          'Emotional Stability': [4, 3, 4],
          Agreeableness: [4, 4, 3],
          Conscientiousness: [3, 4, 4],
          Openness: [5, 4, 5]
        }
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });

    it('should reject boolean answers', () => {
      const invalidData = {
        answers: {
          Extraversion: [true, false, true], // Booleans
          'Emotional Stability': [4, 3, 4],
          Agreeableness: [4, 4, 3],
          Conscientiousness: [3, 4, 4],
          Openness: [5, 4, 5]
        }
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });

    it('should reject null answers', () => {
      const invalidData = {
        answers: {
          Extraversion: [3, null, 4], // null value
          'Emotional Stability': [4, 3, 4],
          Agreeableness: [4, 4, 3],
          Conscientiousness: [3, 4, 4],
          Openness: [5, 4, 5]
        }
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });
  });

  describe('Open-Ended Response Validation', () => {
    it('should accept open-ended response up to 2000 characters', () => {
      const validData = {
        answers: createValidAnswers(),
        openEnded: 'A'.repeat(2000) // Exactly at limit
      };

      const result = questionnaireSchema.parse(validData);
      expect(result.openEnded.length).toBe(2000);
    });

    it('should reject open-ended response over 2000 characters', () => {
      const invalidData = {
        answers: createValidAnswers(),
        openEnded: 'A'.repeat(2001) // One character too long
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });

    it('should accept empty string for open-ended', () => {
      const validData = {
        answers: createValidAnswers(),
        openEnded: ''
      };

      const result = questionnaireSchema.parse(validData);
      expect(result.openEnded).toBe('');
    });

    it('should default to empty string if openEnded not provided', () => {
      const validData = {
        answers: createValidAnswers()
      };

      const result = questionnaireSchema.parse(validData);
      expect(result.openEnded).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should reject answers object with extra unknown traits', () => {
      const invalidData = {
        answers: {
          ...createValidAnswers(),
          UnknownTrait: [3, 3, 3] // Extra trait that shouldn't be there
        }
      };

      // Zod strict mode would reject this, but by default it strips unknown keys
      const result = questionnaireSchema.parse(invalidData);
      expect(result.answers.UnknownTrait).toBeUndefined();
    });

    it('should reject when answers is not an object', () => {
      const invalidData = {
        answers: 'not an object'
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });

    it('should reject when answers is an array instead of object', () => {
      const invalidData = {
        answers: [1, 2, 3, 4, 5]
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });

    it('should reject when openEnded is not a string', () => {
      const invalidData = {
        answers: createValidAnswers(),
        openEnded: 12345 // Number instead of string
      };

      expect(() => questionnaireSchema.parse(invalidData)).toThrow();
    });
  });
});