import { describe, it, expect } from 'vitest'
import { questionnaireSchema } from '../../src/validators/questionnaire.validator'


describe('Questionnaire Validator (Frontend)', () => {
  const validAnswers = {
    Extraversion: [3, 4, 5],
    'Emotional Stability': [2, 3, 4],
    Agreeableness: [4, 5, 3],
    Conscientiousness: [3, 3, 4],
    Openness: [5, 4, 3]
  }

  describe('Valid Data', () => {
    it('should accept complete questionnaire with all answers', () => {
      const data = {
        answers: validAnswers,
        openEnded: 'I enjoy outdoor activities and meeting new people.'
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept questionnaire without open-ended response', () => {
      const data = {
        answers: validAnswers
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(true)
      expect(result.data.openEnded).toBe('')
    })

    it('should accept all valid Likert scale values (1-5)', () => {
      const data = {
        answers: {
          Extraversion: [1, 2, 3],
          'Emotional Stability': [4, 5, 1],
          Agreeableness: [2, 3, 4],
          Conscientiousness: [5, 1, 2],
          Openness: [3, 4, 5]
        }
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('Answer Validation', () => {
    it('should reject answers outside 1-5 range', () => {
      const data = {
        answers: {
          ...validAnswers,
          Extraversion: [0, 3, 4] // 0 is invalid
        }
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject answers above 5', () => {
      const data = {
        answers: {
          ...validAnswers,
          Extraversion: [3, 6, 4] // 6 is invalid
        }
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject non-integer answers', () => {
      const data = {
        answers: {
          ...validAnswers,
          Extraversion: [3.5, 4, 5] // 3.5 is invalid
        }
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Structure Validation', () => {
    it('should reject trait with less than 3 answers', () => {
      const data = {
        answers: {
          ...validAnswers,
          Extraversion: [3, 4] // Only 2 answers
        }
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject trait with more than 3 answers', () => {
      const data = {
        answers: {
          ...validAnswers,
          Extraversion: [3, 4, 5, 2] // 4 answers
        }
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject missing traits', () => {
      const data = {
        answers: {
          Extraversion: [3, 4, 5],
          'Emotional Stability': [2, 3, 4],
          Agreeableness: [4, 5, 3],
          Conscientiousness: [3, 3, 4]
          // Missing Openness
        }
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject completely missing answers object', () => {
      const data = {
        openEnded: 'I like things'
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject when answers is not an object', () => {
      const data = {
        answers: "invalid"
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Open-Ended Response Validation', () => {
    it('should accept empty open-ended response', () => {
      const data = {
        answers: validAnswers,
        openEnded: ''
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept open-ended response at max length (2000 chars)', () => {
      const data = {
        answers: validAnswers,
        openEnded: 'a'.repeat(2000)
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject open-ended response over 2000 characters', () => {
      const data = {
        answers: validAnswers,
        openEnded: 'a'.repeat(2001)
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject non-string open-ended response', () => {
      const data = {
        answers: validAnswers,
        openEnded: 12345
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should strip extra unknown traits (Zod default behavior)', () => {
      const data = {
        answers: {
          ...validAnswers,
          UnknownTrait: [3, 4, 5]
        }
      }

      const result = questionnaireSchema.safeParse(data)
      // Zod strips unknown fields by default
      expect(result.success).toBe(true)
      expect(result.data.answers).not.toHaveProperty('UnknownTrait')
    })

    it('should reject trait answers as non-array', () => {
      const data = {
        answers: {
          ...validAnswers,
          Extraversion: "not an array"
        }
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject null answers', () => {
      const data = {
        answers: {
          ...validAnswers,
          Extraversion: [null, 3, 4]
        }
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject undefined answers', () => {
      const data = {
        answers: {
          ...validAnswers,
          Extraversion: [undefined, 3, 4]
        }
      }

      const result = questionnaireSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})