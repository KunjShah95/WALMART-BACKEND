import express from 'express';
import { body, param, query } from 'express-validator';
import { generateDesigns, getDesignHistory, getDesignById } from '../controllers/designController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const generateDesignValidation = [
  body('prompt')
    .isLength({ min: 10, max: 500 })
    .withMessage('Prompt must be between 10 and 500 characters')
    .trim(),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
  body('category')
    .optional()
    .isIn(['clothing', 'accessories', 'home', 'bags', 'shoes'])
    .withMessage('Category must be one of: clothing, accessories, home, bags, shoes')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

const designIdValidation = [
  param('designId')
    .isUUID()
    .withMessage('Design ID must be a valid UUID')
];

// Routes
router.post('/generate', optionalAuth, generateDesignValidation, generateDesigns);
router.get('/history', authenticateToken, paginationValidation, getDesignHistory);
router.get('/:designId', authenticateToken, designIdValidation, getDesignById);

export default router;