export default function errorHandler(err, _req, res, _next) {
  // Log the error for debugging
  console.error('[ERROR]', err.message);
  
  // Default to 500 Internal Server Error
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Invalid input data';
  }

  // In development, send full error details
  // In production, hide error details for security
  const response = {
    error: message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}