/**
 * Standardized Error Response Utilities
 *
 * Provides consistent error response format across the entire API.
 * All error responses follow the same structure for easy client handling.
 */

/**
 * Standard error response format:
 * {
 *   success: false,
 *   message: "Human-readable error message",
 *   errors: {} // Optional, for validation errors
 * }
 */

/**
 * Send a standardized error response
 *
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object} errors - Optional validation errors object
 */
export function sendError(res, statusCode, message, errors = null) {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send a 400 Bad Request error
 */
export function badRequest(res, message = 'Bad request', errors = null) {
  return sendError(res, 400, message, errors);
}

/**
 * Send a 401 Unauthorized error
 */
export function unauthorized(res, message = 'Unauthorized') {
  return sendError(res, 401, message);
}

/**
 * Send a 403 Forbidden error
 */
export function forbidden(res, message = 'Forbidden') {
  return sendError(res, 403, message);
}

/**
 * Send a 404 Not Found error
 */
export function notFound(res, message = 'Resource not found') {
  return sendError(res, 404, message);
}

/**
 * Send a 409 Conflict error
 */
export function conflict(res, message = 'Resource already exists', errors = null) {
  return sendError(res, 409, message, errors);
}

/**
 * Send a 422 Unprocessable Entity error (validation failure)
 */
export function validationError(res, message = 'Validation failed', errors = {}) {
  return sendError(res, 422, message, errors);
}

/**
 * Send a 429 Too Many Requests error
 */
export function tooManyRequests(res, message = 'Too many requests, please try again later') {
  return sendError(res, 429, message);
}

/**
 * Send a 500 Internal Server Error
 */
export function internalError(res, message = 'Internal server error') {
  return sendError(res, 500, message);
}

/**
 * Send a standardized success response
 *
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object} data - Optional data payload
 */
export function sendSuccess(res, statusCode = 200, message = 'Success', data = null) {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send a 200 OK success response
 */
export function ok(res, data = null, message = 'Success') {
  return sendSuccess(res, 200, message, data);
}

/**
 * Send a 201 Created success response
 */
export function created(res, data = null, message = 'Resource created successfully') {
  return sendSuccess(res, 201, message, data);
}

/**
 * Send a 204 No Content success response
 */
export function noContent(res) {
  return res.status(204).send();
}
