 export function validate(schema) {
    return (req, res, next) => {
      try {
        schema.parse(req.body);
        next(); // Validation passed, continue to route handler
      } catch (error) {
        // Validation failed, send error response
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      }
    };
  }