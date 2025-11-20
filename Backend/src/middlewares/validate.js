// Backend/src/middlewares/validate.js
import { ZodError } from 'zod';

export const validate = (schema) => {
  // This is the actual middleware function that Express will call
  return (req, res, next) => {
    try {
      /**
       * schema.parse() does two things:
       * 1. Validates the data against all rules in the schema
       * 2. Returns the TRANSFORMED data (trimmed, lowercase, etc.)
       *
       * If validation fails, it throws a ZodError
       * If validation passes, we get clean, validated data
       */
      const validatedData = schema.parse(req.body);

      /**
       * Replace req.body with validated/transformed data
       *
       * This is important! The route handler will now receive:
       * - Trimmed strings (no leading/trailing whitespace)
       * - Lowercase emails
       * - Properly typed arrays (interests)
       * - Default values filled in
       */
      req.body = validatedData;

      // Pass control to the next middleware or route handler
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        /**
         * Format Zod errors into user-friendly messages
         *
         * ZodError.errors is an array of all validation failures.
         * Each error has:
         * - path: where the error occurred (e.g., ['email'] or ['user', 'name'])
         * - message: the error message we defined in the schema
         *
         * We transform this into a clean object:
         * {
         *   email: 'Please enter a valid email address',
         *   password: 'Password must be at least 8 characters'
         * }
         */
        const formattedErrors = formatZodErrors(error);

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors
        });
      }

      // If it's not a ZodError, pass it to the global error handler
      next(error);
    }
  };
};

/**
 * Format Zod errors into a user-friendly object
 *
 * Input: ZodError with array of issues
 * Output: { fieldName: 'error message', ... }
 *
 * @param {ZodError} error
 * @returns {Object} Formatted errors keyed by field name
 */
function formatZodErrors(error) {
  const formatted = {};

  for (const issue of error.errors) {
    /**
     * issue.path is an array representing the path to the error
     * Examples:
     * - ['email'] → error in the email field
     * - ['user', 'profile', 'age'] → nested object error
     *
     * We join with '.' for nested paths, or use the first element for simple cases
     */
    const fieldName = issue.path.length > 0 ? issue.path.join('.') : 'general';

    // Only keep the first error for each field (cleaner UX)
    if (!formatted[fieldName]) {
      formatted[fieldName] = issue.message;
    }
  }

  return formatted;
}

/**
 * BONUS: Validate specific parts of the request
 *
 * Sometimes you need to validate query params or URL params, not just body.
 * These helper functions do exactly that.
 */

/**
 * Validate request query parameters
 * Usage: router.get('/search', validateQuery(searchQuerySchema), handler);
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: formatZodErrors(error)
        });
      }
      next(error);
    }
  };
};

/**
 * Validate URL parameters
 * Usage: router.get('/users/:id', validateParams(userIdSchema), handler);
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid URL parameters',
          errors: formatZodErrors(error)
        });
      }
      next(error);
    }
  };
};