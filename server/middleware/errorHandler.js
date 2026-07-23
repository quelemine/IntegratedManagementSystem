/**
 * Global error handler middleware
 * Provides consistent error responses across the application
 */

const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = {
    success: false,
    message: 'Internal server error',
    status: 500
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = err.message || 'Validation failed';
    error.status = 400;
  } else if (err.name === 'UnauthorizedError') {
    error.message = 'Unauthorized access';
    error.status = 401;
  } else if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.status = 401;
  } else if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.status = 401;
  } else if (err.code === '23505') {
    // PostgreSQL unique violation
    error.message = 'Duplicate entry detected';
    error.status = 409;
  } else if (err.code === '23503') {
    // PostgreSQL foreign key violation
    error.message = 'Referenced record does not exist';
    error.status = 400;
  } else if (err.code === '23502') {
    // PostgreSQL not null violation
    error.message = 'Required field missing';
    error.status = 400;
  } else if (err.status) {
    // Custom error with status
    error.message = err.message;
    error.status = err.status;
  }

  // Production-safe error details
  if (process.env.NODE_ENV === 'production') {
    // Only include error details for client errors (4xx)
    if (error.status >= 400 && error.status < 500) {
      return res.status(error.status).json({
        success: false,
        error: error.message
      });
    }
    // For server errors, don't expose details
    return res.status(500).json({
      success: false,
      error: 'An error occurred. Please try again later.'
    });
  }

  // Development mode - include more details
  res.status(error.status).json({
    success: false,
    error: error.message,
    stack: err.stack,
    details: err.details || null
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
