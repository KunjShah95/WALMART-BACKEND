import { supabase } from '../services/supabase.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    // Verify with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }

    // Add user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({
      error: 'Authentication failed',
      message: 'Failed to authenticate token'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // For optional auth, we continue even if there's an error
    next();
  }
};