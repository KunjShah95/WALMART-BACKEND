export const formatResponse = (data, message = 'Success', meta = {}) => {
  return {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
};

export const formatErrorResponse = (error, message = 'An error occurred') => {
  return {
    success: false,
    error: message,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    timestamp: new Date().toISOString()
  };
};

export const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}${timestamp}${random}`;
};

export const calculateSustainabilityGrade = (score) => {
  if (score >= 9.0) return 'A+';
  if (score >= 8.5) return 'A';
  if (score >= 8.0) return 'A-';
  if (score >= 7.5) return 'B+';
  if (score >= 7.0) return 'B';
  if (score >= 6.5) return 'B-';
  if (score >= 6.0) return 'C+';
  if (score >= 5.5) return 'C';
  if (score >= 5.0) return 'C-';
  if (score >= 4.0) return 'D';
  return 'F';
};

export const validateEnvironment = () => {
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_API_KEY',
    'MISTRAL_API_KEY',
    'JWT_SECRET'
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

export const logRequest = (req) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous'
  });
};