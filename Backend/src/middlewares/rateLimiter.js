import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter - 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Auth rate limiter - 5 login/signup attempts per 15 minutes per IP
 * Prevents brute force attacks on authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Search rate limiter - 30 searches per minute per IP
 * Prevents enumeration attacks on user search
 */
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 search requests per minute
  message: 'Too many search requests, please slow down.',
});

/**
 * Friend request rate limiter - 10 friend requests per hour per IP
 * Prevents spam friend requests
 */
export const friendRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 friend requests per hour
  message: 'Too many friend requests sent, please try again later.',
});
