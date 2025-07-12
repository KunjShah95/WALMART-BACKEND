import express from 'express';
import { body, param, query } from 'express-validator';
import { submitOrder, getOrderHistory, getOrderById, updateOrderStatus } from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const submitOrderValidation = [
  body('design_id')
    .isUUID()
    .withMessage('Design ID must be a valid UUID'),
  body('material_score_id')
    .optional()
    .isUUID()
    .withMessage('Material score ID must be a valid UUID'),
  body('selected_materials')
    .isArray({ min: 1 })
    .withMessage('Selected materials must be a non-empty array'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  body('shipping_address')
    .isObject()
    .withMessage('Shipping address is required'),
  body('shipping_address.street')
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address is required'),
  body('shipping_address.city')
    .isLength({ min: 2, max: 100 })
    .withMessage('City is required'),
  body('shipping_address.state')
    .isLength({ min: 2, max: 100 })
    .withMessage('State is required'),
  body('shipping_address.zip_code')
    .isLength({ min: 5, max: 10 })
    .withMessage('Valid zip code is required'),
  body('shipping_address.country')
    .isLength({ min: 2, max: 100 })
    .withMessage('Country is required'),
  body('estimated_price')
    .isFloat({ min: 0 })
    .withMessage('Estimated price must be a positive number'),
  body('manufacturing_preferences')
    .optional()
    .isObject()
    .withMessage('Manufacturing preferences must be an object')
];

const updateOrderValidation = [
  param('orderId')
    .isUUID()
    .withMessage('Order ID must be a valid UUID'),
  body('status')
    .isIn(['cancelled'])
    .withMessage('Status must be: cancelled'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be under 500 characters')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Status must be valid order status')
];

const orderIdValidation = [
  param('orderId')
    .isUUID()
    .withMessage('Order ID must be a valid UUID')
];

// Routes - all require authentication
router.post('/submit', authenticateToken, submitOrderValidation, submitOrder);
router.get('/history', authenticateToken, paginationValidation, getOrderHistory);
router.get('/:orderId', authenticateToken, orderIdValidation, getOrderById);
router.patch('/:orderId/status', authenticateToken, updateOrderValidation, updateOrderStatus);

export default router;