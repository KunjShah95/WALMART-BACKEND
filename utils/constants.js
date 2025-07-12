export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PRODUCTION: 'in_production',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const PRODUCT_CATEGORIES = {
  CLOTHING: 'clothing',
  ACCESSORIES: 'accessories',
  HOME: 'home',
  BAGS: 'bags',
  SHOES: 'shoes'
};

export const MATERIAL_TYPES = {
  ORGANIC: 'organic',
  RECYCLED: 'recycled',
  SUSTAINABLE: 'sustainable',
  CONVENTIONAL: 'conventional'
};

export const SUSTAINABILITY_GRADES = {
  'A+': { min: 9.0, max: 10.0 },
  'A': { min: 8.5, max: 8.9 },
  'A-': { min: 8.0, max: 8.4 },
  'B+': { min: 7.5, max: 7.9 },
  'B': { min: 7.0, max: 7.4 },
  'B-': { min: 6.5, max: 6.9 },
  'C+': { min: 6.0, max: 6.4 },
  'C': { min: 5.5, max: 5.9 },
  'C-': { min: 5.0, max: 5.4 },
  'D': { min: 4.0, max: 4.9 },
  'F': { min: 0.0, max: 3.9 }
};

export const API_LIMITS = {
  DESIGN_PROMPT_MIN: 10,
  DESIGN_PROMPT_MAX: 500,
  MATERIALS_MAX: 10,
  ORDER_QUANTITY_MAX: 100,
  PAGINATION_MAX: 50
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION_FAILED: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  AI_SERVICE_ERROR: 'AI service temporarily unavailable',
  DATABASE_ERROR: 'Database operation failed'
};

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User account created successfully',
  LOGIN_SUCCESS: 'Authentication successful',
  DESIGN_GENERATED: 'Product designs generated successfully',
  MATERIALS_SCORED: 'Sustainability score calculated successfully',
  ORDER_SUBMITTED: 'Order submitted successfully',
  ORDER_UPDATED: 'Order status updated successfully'
};