export const notFound = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
    available_endpoints: [
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'POST /api/design/generate',
      'POST /api/materials/score',
      'POST /api/order/submit',
      'GET /health'
    ],
    timestamp: new Date().toISOString()
  });
};