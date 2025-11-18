import { describe, it, expect } from '@jest/globals';
import { signupSchema, loginSchema } from '../../src/validators/auth.validator.js';


describe('Auth Validators', () => {
  describe('signupSchema', () => {
    describe('Valid Data (Happy Path)', () => {
      it('should accept valid signup data', () => {
        // Arrange - create valid test data
        const validData = {
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345'
        };

        // Act - run the validator
        const result = signupSchema.parse(validData);

        // Assert - check the result
        expect(result).toBeDefined();
        expect(result.email).toBe('test@example.com');
        expect(result.firstName).toBe('John');
      });

      it('should accept ZIP+4 format', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345-6789' // Extended ZIP
        };

        const result = signupSchema.parse(validData);
        expect(result.zip).toBe('12345-6789');
      });

      it('should accept optional fields', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345',
          gender: 'male',
          bio: 'I love events!',
          interests: ['music', 'sports']
        };

        const result = signupSchema.parse(validData);
        expect(result.gender).toBe('male');
        expect(result.bio).toBe('I love events!');
        expect(result.interests).toEqual(['music', 'sports']);
      });
    });

    describe('Data Transformation', () => {
      it('should trim and lowercase email', () => {
        const data = {
          email: '  TEST@EXAMPLE.COM  ',
          password: 'Test123!@#',
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345'
        };

        const result = signupSchema.parse(data);
        expect(result.email).toBe('test@example.com'); // Trimmed and lowercase
      });

      it('should trim whitespace from names', () => {
        const data = {
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: '  John  ',
          lastName: '  Doe  ',
          zip: '12345'
        };

        const result = signupSchema.parse(data);
        expect(result.firstName).toBe('John');
        expect(result.lastName).toBe('Doe');
      });

      it('should convert comma-separated interests to array', () => {
        const data = {
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345',
          interests: 'music, sports, arts' // String instead of array
        };

        const result = signupSchema.parse(data);
        expect(Array.isArray(result.interests)).toBe(true);
        expect(result.interests).toEqual(['music', 'sports', 'arts']);
      });

      it('should default interests to empty array if not provided', () => {
        const data = {
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345'
        };

        const result = signupSchema.parse(data);
        expect(result.interests).toEqual([]);
      });
    });

    describe('Email Validation', () => {
      it('should reject invalid email format', () => {
        const invalidData = {
          email: 'not-an-email',
          password: 'Test123!@#',
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345'
        };

        expect(() => signupSchema.parse(invalidData)).toThrow();
      });

      it('should reject missing email', () => {
        const invalidData = {
          password: 'Test123!@#',
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345'
        };

        expect(() => signupSchema.parse(invalidData)).toThrow();
      });

      it('should reject email without domain', () => {
        const invalidData = {
          email: 'test@',
          password: 'Test123!@#',
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345'
        };

        expect(() => signupSchema.parse(invalidData)).toThrow();
      });
    });

    describe('Password Validation', () => {
      it('should reject password shorter than 8 characters', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Test1!', // Only 6 characters
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345'
        };

        expect(() => signupSchema.parse(invalidData)).toThrow('at least 8 characters');
      });

      it('should reject password without uppercase letter', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'test123!@#', // No uppercase
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345'
        };

        expect(() => signupSchema.parse(invalidData)).toThrow('uppercase');
      });

      it('should reject password without lowercase letter', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'TEST123!@#', // No lowercase
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345'
        };

        expect(() => signupSchema.parse(invalidData)).toThrow('lowercase');
      });

      it('should reject password without number', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'TestTest!@#', // No number
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345'
        };

        expect(() => signupSchema.parse(invalidData)).toThrow('number');
      });

      it('should reject password without special character', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Test12345', // No special char
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345'
        };

        expect(() => signupSchema.parse(invalidData)).toThrow('special character');
      });
    });

    describe('Name Validation', () => {
      it('should reject empty first name', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: '',
          lastName: 'Doe',
          zip: '12345'
        };

        expect(() => signupSchema.parse(invalidData)).toThrow('cannot be empty');
      });

      it('should reject empty last name', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: 'John',
          lastName: '',
          zip: '12345'
        };

        expect(() => signupSchema.parse(invalidData)).toThrow('cannot be empty');
      });

      it('should reject names that are only whitespace', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: '   ',
          lastName: 'Doe',
          zip: '12345'
        };

        expect(() => signupSchema.parse(invalidData)).toThrow();
      });

      it('should reject names longer than 50 characters', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: 'J'.repeat(51), // 51 characters
          lastName: 'Doe',
          zip: '12345'
        };

        expect(() => signupSchema.parse(invalidData)).toThrow('too long');
      });
    });

    describe('ZIP Code Validation', () => {
      it('should reject 4-digit ZIP', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: 'John',
          lastName: 'Doe',
          zip: '1234' // Too short
        };

        expect(() => signupSchema.parse(invalidData)).toThrow('valid ZIP');
      });

      it('should reject 6-digit ZIP', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: 'John',
          lastName: 'Doe',
          zip: '123456' // Too long
        };

        expect(() => signupSchema.parse(invalidData)).toThrow('valid ZIP');
      });

      it('should reject ZIP with letters', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: 'John',
          lastName: 'Doe',
          zip: 'ABCDE'
        };

        expect(() => signupSchema.parse(invalidData)).toThrow('valid ZIP');
      });

      it('should reject malformed ZIP+4', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345-67' // Incomplete +4
        };

        expect(() => signupSchema.parse(invalidData)).toThrow('valid ZIP');
      });
    });

    describe('Bio Validation', () => {
      it('should reject bio longer than 500 characters', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345',
          bio: 'A'.repeat(501) // 501 characters
        };

        expect(() => signupSchema.parse(invalidData)).toThrow('500 characters');
      });

      it('should accept bio with exactly 500 characters', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Test123!@#',
          firstName: 'John',
          lastName: 'Doe',
          zip: '12345',
          bio: 'A'.repeat(500) // Exactly 500
        };

        const result = signupSchema.parse(validData);
        expect(result.bio.length).toBe(500);
      });
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'any-password' // Login doesn't enforce strength
      };

      const result = loginSchema.parse(validData);
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBe('any-password');
    });

    it('should trim and lowercase email', () => {
      const data = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password'
      };

      const result = loginSchema.parse(data);
      expect(result.email).toBe('test@example.com');
    });

    it('should reject missing email', () => {
      const invalidData = {
        password: 'password'
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      };

      expect(() => loginSchema.parse(invalidData)).toThrow('Password is required');
    });

    it('should NOT enforce password strength on login', () => {
      // Users might have weak passwords from before we added strength requirements
      const data = {
        email: 'test@example.com',
        password: 'weak' // This is fine for login
      };

      const result = loginSchema.parse(data);
      expect(result.password).toBe('weak');
    });
  });
});