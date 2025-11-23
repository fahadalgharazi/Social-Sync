import { describe, it, expect } from 'vitest'
import { loginSchema, signupSchema } from '../../src/validators/auth.validator'



describe('Auth Validators (Frontend)', () => {
  describe('loginSchema', () => {
    it('should accept valid login credentials', () => {
      const validData = {
        email: 'test@example.com',
        password: 'MyPassword123!'
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        email: 'test@example.com',
        password: 'MyPassword123!'
      })
    })

    it('should lowercase email', () => {
      const data = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      }

      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(true)
      expect(result.data.email).toBe('test@example.com')
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123'
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error.issues[0].path[0]).toBe('email')
    })

    it('should reject missing email', () => {
      const invalidData = {
        password: 'password123'
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com'
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('signupSchema', () => {
    it('should accept valid signup data with all required fields', () => {
      const validData = {
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        zip: '12345'
      }

      const result = signupSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept optional fields', () => {
      const validData = {
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        zip: '12345',
        gender: 'male',
        bio: 'Hello world',
        interests: 'hiking, coding'
      }

      const result = signupSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data.gender).toBe('male')
      expect(result.data.bio).toBe('Hello world')
      expect(result.data.interests).toBe('hiking, coding')
    })

    it('should trim whitespace from names', () => {
      const data = {
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        firstName: '  John  ',
        lastName: '  Doe  ',
        zip: '12345'
      }

      const result = signupSchema.safeParse(data)
      expect(result.success).toBe(true)
      expect(result.data.firstName).toBe('John')
      expect(result.data.lastName).toBe('Doe')
    })

    it('should reject passwords that do not match', () => {
      const invalidData = {
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass456!',
        firstName: 'John',
        lastName: 'Doe',
        zip: '12345'
      }

      const result = signupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      // Error should be on confirmPassword field
      const confirmError = result.error.issues.find(issue =>
        issue.path.includes('confirmPassword')
      )
      expect(confirmError).toBeDefined()
      expect(confirmError.message).toContain('do not match')
    })

    it('should enforce password requirements', () => {
      const testCases = [
        { password: 'short', reason: 'too short' },
        { password: 'nouppercase123!', reason: 'no uppercase' },
        { password: 'NOLOWERCASE123!', reason: 'no lowercase' },
        { password: 'NoNumbers!', reason: 'no numbers' },
        { password: 'NoSpecial123', reason: 'no special chars' }
      ]

      testCases.forEach(({ password, reason }) => {
        const data = {
          email: 'john@example.com',
          password,
          confirmPassword: password,
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345'
        }

        const result = signupSchema.safeParse(data)
        expect(result.success).toBe(false), `Expected failure for: ${reason}`
      })
    })

    it('should accept ZIP+4 format', () => {
      const data = {
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        zip: '12345-6789'
      }

      const result = signupSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid ZIP codes', () => {
      const invalidZips = ['1234', '123456', 'abcde', '12-345']

      invalidZips.forEach(zip => {
        const data = {
          email: 'john@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          zip
        }

        const result = signupSchema.safeParse(data)
        expect(result.success).toBe(false), `Expected ${zip} to be invalid`
      })
    })

    it('should reject bio longer than 500 characters', () => {
      const data = {
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        zip: '12345',
        bio: 'a'.repeat(501)
      }

      const result = signupSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject empty names after trimming', () => {
      const data = {
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        firstName: '   ',
        lastName: 'Doe',
        zip: '12345'
      }

      const result = signupSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject names longer than 50 characters', () => {
      const data = {
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        firstName: 'a'.repeat(51),
        lastName: 'Doe',
        zip: '12345'
      }

      const result = signupSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})