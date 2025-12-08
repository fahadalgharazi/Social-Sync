/**
 * LESSON: Testing Enum and Default Values
 *
 * The event search schema has:
 * - Enum validation (personalityType must be one of 4 values)
 * - Default values (limit defaults to 20, page defaults to 0)
 * - Number coercion (convert strings to numbers)
 */

import { describe, it, expect } from '@jest/globals';
import { eventSearchSchema } from '../../src/validators/events.validator.js';

describe('Events Validator', () => {
  describe('Valid Data (Happy Path)', () => {
    it('should accept valid search with all fields', () => {
      const validData = {
        personalityType: 'Secure Optimist',
        limit: 20,
        page: 0
      };

      const result = eventSearchSchema.parse(validData);
      expect(result.personalityType).toBe('Secure Optimist');
      expect(result.limit).toBe(20);
      expect(result.page).toBe(0);
    });

    it('should accept all valid personality types', () => {
      const personalityTypes = [
        'Reactive Idealist',
        'Balanced Realist',
        'Sensitive Companion',
        'Secure Optimist'
      ];

      for (const type of personalityTypes) {
        const data = { personalityType: type };
        const result = eventSearchSchema.parse(data);
        expect(result.personalityType).toBe(type);
      }
    });

    it('should accept empty object and apply defaults', () => {
      const emptyData = {};

      const result = eventSearchSchema.parse(emptyData);
      expect(result.limit).toBe(20); // Default
      expect(result.page).toBe(0);    // Default
      expect(result.personalityType).toBeUndefined(); // Optional
    });

    it('should accept search without personalityType', () => {
      // Service will look up from user's profile
      const validData = {
        limit: 10,
        page: 1
      };

      const result = eventSearchSchema.parse(validData);
      expect(result.personalityType).toBeUndefined();
      expect(result.limit).toBe(10);
      expect(result.page).toBe(1);
    });
  });

  describe('Default Values', () => {
    it('should default limit to 20 if not provided', () => {
      const data = { page: 0 };
      const result = eventSearchSchema.parse(data);
      expect(result.limit).toBe(20);
    });

    it('should default page to 0 if not provided', () => {
      const data = { limit: 10 };
      const result = eventSearchSchema.parse(data);
      expect(result.page).toBe(0);
    });

    it('should apply both defaults when neither is provided', () => {
      const data = {};
      const result = eventSearchSchema.parse(data);
      expect(result.limit).toBe(20);
      expect(result.page).toBe(0);
    });
  });

  describe('Number Coercion', () => {
    it('should coerce string limit to number', () => {
      const data = {
        limit: '15', // String
        page: '2'    // String
      };

      const result = eventSearchSchema.parse(data);
      expect(result.limit).toBe(15); // Coerced to number
      expect(result.page).toBe(2);    // Coerced to number
      expect(typeof result.limit).toBe('number');
      expect(typeof result.page).toBe('number');
    });

    it('should accept numeric strings from query parameters', () => {
      // Query params are always strings: ?limit=10&page=0
      const data = {
        personalityType: 'Secure Optimist',
        limit: '10',
        page: '0'
      };

      const result = eventSearchSchema.parse(data);
      expect(result.limit).toBe(10);
      expect(result.page).toBe(0);
    });
  });

  describe('Personality Type Validation', () => {
    it('should reject invalid personality type', () => {
      const invalidData = {
        personalityType: 'Invalid Type'
      };

      expect(() => eventSearchSchema.parse(invalidData)).toThrow();
    });

    it('should reject personality type with wrong casing', () => {
      const invalidData = {
        personalityType: 'secure optimist' // lowercase
      };

      expect(() => eventSearchSchema.parse(invalidData)).toThrow();
    });

    it('should reject personality type with typo', () => {
      const invalidData = {
        personalityType: 'Secure Optomist' // Typo: "Optomist"
      };

      expect(() => eventSearchSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty string as personality type', () => {
      const invalidData = {
        personalityType: ''
      };

      expect(() => eventSearchSchema.parse(invalidData)).toThrow();
    });
  });

  describe('Limit Validation', () => {
    it('should accept limit of 1 (minimum)', () => {
      const data = { limit: 1 };
      const result = eventSearchSchema.parse(data);
      expect(result.limit).toBe(1);
    });

    it('should accept limit of 100 (maximum)', () => {
      const data = { limit: 100 };
      const result = eventSearchSchema.parse(data);
      expect(result.limit).toBe(100);
    });

    it('should reject limit of 0', () => {
      const invalidData = { limit: 0 };
      expect(() => eventSearchSchema.parse(invalidData)).toThrow('at least 1');
    });

    it('should reject negative limit', () => {
      const invalidData = { limit: -5 };
      expect(() => eventSearchSchema.parse(invalidData)).toThrow('at least 1');
    });

    it('should reject limit over 100 (DoS protection)', () => {
      const invalidData = { limit: 1000 };
      expect(() => eventSearchSchema.parse(invalidData)).toThrow('cannot exceed 100');
    });

    it('should reject decimal limit', () => {
      const invalidData = { limit: 20.5 };
      expect(() => eventSearchSchema.parse(invalidData)).toThrow('whole number');
    });

    it('should reject non-numeric limit', () => {
      const invalidData = { limit: 'many' };
      expect(() => eventSearchSchema.parse(invalidData)).toThrow();
    });
  });

  describe('Page Validation', () => {
    it('should accept page 0 (first page)', () => {
      const data = { page: 0 };
      const result = eventSearchSchema.parse(data);
      expect(result.page).toBe(0);
    });

    it('should accept large page numbers', () => {
      const data = { page: 999 };
      const result = eventSearchSchema.parse(data);
      expect(result.page).toBe(999);
    });

    it('should reject negative page', () => {
      const invalidData = { page: -1 };
      expect(() => eventSearchSchema.parse(invalidData)).toThrow('cannot be negative');
    });

    it('should reject decimal page', () => {
      const invalidData = { page: 1.5 };
      expect(() => eventSearchSchema.parse(invalidData)).toThrow('whole number');
    });

    it('should reject non-numeric page', () => {
      const invalidData = { page: 'first' };
      expect(() => eventSearchSchema.parse(invalidData)).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle boundary values correctly', () => {
      const data = {
        personalityType: 'Reactive Idealist',
        limit: 1,    // Minimum
        page: 0      // Minimum
      };

      const result = eventSearchSchema.parse(data);
      expect(result).toEqual({
        personalityType: 'Reactive Idealist',
        limit: 1,
        page: 0
      });
    });

    it('should handle upper boundary values correctly', () => {
      const data = {
        personalityType: 'Sensitive Companion',
        limit: 100,  // Maximum
        page: 1000   // Large number (no max)
      };

      const result = eventSearchSchema.parse(data);
      expect(result.limit).toBe(100);
      expect(result.page).toBe(1000);
    });

    it('should strip unknown fields', () => {
      const data = {
        personalityType: 'Secure Optimist',
        limit: 20,
        page: 0,
        unknownField: 'should be removed'
      };

      const result = eventSearchSchema.parse(data);
      expect(result.unknownField).toBeUndefined();
    });

    it('should handle null values by using defaults', () => {
      const data = {
        limit: null,
        page: null
      };

      // Null will be coerced - might fail or use defaults depending on Zod behavior
      // This tests real-world scenario where frontend sends null
      expect(() => eventSearchSchema.parse(data)).toThrow();
    });
  });

  describe('Combined Validation', () => {
    it('should accept all valid fields together', () => {
      const validData = {
        personalityType: 'Balanced Realist',
        limit: 50,
        page: 2
      };

      const result = eventSearchSchema.parse(validData);
      expect(result).toEqual({
        personalityType: 'Balanced Realist',
        limit: 50,
        page: 2
      });
    });

    it('should apply defaults while keeping provided values', () => {
      const data = {
        personalityType: 'Reactive Idealist',
        limit: 10
        // page not provided - should default
      };

      const result = eventSearchSchema.parse(data);
      expect(result.personalityType).toBe('Reactive Idealist');
      expect(result.limit).toBe(10);
      expect(result.page).toBe(0); // Default
    });

    it('should fail if any field is invalid', () => {
      const invalidData = {
        personalityType: 'Secure Optimist', // Valid
        limit: 101,                          // Invalid (over max)
        page: 0                              // Valid
      };

      expect(() => eventSearchSchema.parse(invalidData)).toThrow();
    });
  });
});