/**
 * Input Sanitization Utilities
 *
 * Prevents XSS attacks by sanitizing user-generated content.
 * Applied to fields like bio, interests, and open-ended responses.
 */

import validator from 'validator';

/**
 * Sanitize a string by escaping HTML and removing dangerous patterns
 *
 * @param {string} input - The input string to sanitize
 * @param {object} options - Sanitization options
 * @returns {string} - Sanitized string
 */
export function sanitizeString(input, options = {}) {
  if (!input || typeof input !== 'string') {
    return input;
  }

  let sanitized = input;

  // 1. Trim whitespace (already done by Zod, but defensive)
  sanitized = sanitized.trim();

  // 2. Escape HTML to prevent XSS
  // This converts < to &lt;, > to &gt;, etc.
  sanitized = validator.escape(sanitized);

  // 3. Optional: Normalize whitespace (collapse multiple spaces)
  if (options.normalizeWhitespace) {
    sanitized = sanitized.replace(/\s+/g, ' ');
  }

  return sanitized;
}

/**
 * Sanitize bio field
 * Bios are displayed to other users, so must be safe from XSS
 */
export function sanitizeBio(bio) {
  if (!bio) return bio;

  return sanitizeString(bio, {
    normalizeWhitespace: true
  });
}

/**
 * Sanitize interests (comma-separated list)
 * Each interest is trimmed and sanitized
 */
export function sanitizeInterests(interests) {
  if (!interests) return interests;

  // If it's an array (from Zod transform), join it
  if (Array.isArray(interests)) {
    return interests
      .map(interest => sanitizeString(interest.trim()))
      .filter(Boolean)
      .join(', ');
  }

  // If it's a string, split, sanitize, and rejoin
  return interests
    .split(',')
    .map(interest => sanitizeString(interest.trim()))
    .filter(Boolean)
    .join(', ');
}

/**
 * Sanitize open-ended questionnaire responses
 */
export function sanitizeOpenEnded(text) {
  if (!text) return text;

  return sanitizeString(text, {
    normalizeWhitespace: true
  });
}

/**
 * Sanitize username (additional safety beyond Zod regex)
 * Ensures only alphanumeric and underscores
 */
export function sanitizeUsername(username) {
  if (!username) return username;

  // Remove any characters that aren't alphanumeric or underscore
  return username.replace(/[^a-zA-Z0-9_]/g, '');
}

/**
 * Middleware to sanitize request body fields
 * Apply this after validation but before using the data
 */
export function sanitizeBody(fieldsToSanitize = []) {
  return (req, res, next) => {
    if (!req.body) {
      return next();
    }

    fieldsToSanitize.forEach(field => {
      if (req.body[field]) {
        req.body[field] = sanitizeString(req.body[field]);
      }
    });

    next();
  };
}
