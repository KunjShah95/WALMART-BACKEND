export const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = {
    status: 500,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Supabase errors
  if (err.message?.includes('duplicate key')) {
    error = {
      status: 409,
      message: 'Resource already exists',
      details: 'A resource with these details already exists'
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = {
      status: 400,
      message: 'Validation Error',
      details: err.message
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      status: 401,
      message: 'Invalid token'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      status: 401,
      message: 'Token expired'
    };
  }

  // AI API errors
  if (err.message?.includes('API key')) {
    error = {
      status: 500,
      message: 'AI service configuration error',
      details: 'Please contact support'
    };
  }

  res.status(error.status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && error.stack && { stack: error.stack })
  });
};