import { describe, it, expect } from '@jest/globals';
import { sanitizeString, sanitizeBio, sanitizeUsername } from '../../utils/sanitize.js';

describe('Sanitization Utility Tests', () => {
  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      const input = '  test string  ';
      const result = sanitizeString(input);
      expect(result).toBe('test string');
    });

    it('should escape HTML characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeString(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });

    it('should handle empty strings', () => {
      const result = sanitizeString('');
      expect(result).toBe('');
    });

    it('should handle null values', () => {
      const result = sanitizeString(null);
      expect(result).toBe(null);
    });

    it('should normalize whitespace when option is set', () => {
      const input = 'test  multiple   spaces';
      const result = sanitizeString(input, { normalizeWhitespace: true });
      expect(result).toBe('test multiple spaces');
    });
  });

  describe('sanitizeBio', () => {
    it('should sanitize bio text', () => {
      const input = '  I love <b>coding</b>!  ';
      const result = sanitizeBio(input);
      expect(result).not.toContain('<b>');
    });

    it('should normalize whitespace in bio', () => {
      const input = 'I  love   coding!';
      const result = sanitizeBio(input);
      expect(result).toBe('I love coding!');
    });
  });

  describe('sanitizeUsername', () => {
    it('should sanitize username', () => {
      const input = '  john_doe123  ';
      const result = sanitizeUsername(input);
      expect(result).toBe('john_doe123');
    });

    it('should escape HTML in username', () => {
      const input = 'user<script>';
      const result = sanitizeUsername(input);
      expect(result).not.toContain('<script>');
    });
  });
});
