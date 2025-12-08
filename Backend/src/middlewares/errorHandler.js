/**
 * Global Error Handler Middleware
 *
 * Catches all errors and sends standardized error responses.
 * Logs errors for debugging while hiding sensitive details in production.
 */

export default function errorHandler(err, _req, res, _next) {
  // Log the error for debugging (should use Winston in production)
  console.error('[ERROR]', {
    message: err.message,
    stack: err.stack,
    status: err.status,
  });

  // Default to 500 Internal Server Error
  const status = err.status || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    message = 'Validation failed';
  }

  // Build standardized error response
  const response = {
    success: false,
    message: status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error' // Hide details in production
      : message,
  };

  // Include error details in development only
  if (process.env.NODE_ENV === 'development') {
    response.error = {
      type: err.name,
      details: err.message,
      stack: err.stack,
    };
  }

  // Include validation errors if present
  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(status).json(response);
}
