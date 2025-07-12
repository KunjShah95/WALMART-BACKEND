import express from 'express';
import { body, query } from 'express-validator';
import { scoreMaterials, getMaterialScoreHistory, compareMaterials } from '../controllers/materialsController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const scoreMaterialsValidation = [
  body('materials')
    .isArray({ min: 1 })
    .withMessage('Materials must be a non-empty array'),
  body('materials.*')
    .isObject()
    .withMessage('Each material must be an object'),
  body('materials.*.name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Material name is required and must be under 100 characters'),
  body('product_type')
    .optional()
    .isIn(['clothing', 'accessories', 'home', 'bags', 'shoes'])
    .withMessage('Product type must be one of: clothing, accessories, home, bags, shoes'),
  body('design_id')
    .optional()
    .isUUID()
    .withMessage('Design ID must be a valid UUID')
];

const compareMaterialsValidation = [
  body('material_sets')
    .isArray({ min: 2, max: 5 })
    .withMessage('Material sets must be an array with 2-5 elements'),
  body('material_sets.*')
    .isArray({ min: 1 })
    .withMessage('Each material set must be a non-empty array'),
  body('product_type')
    .optional()
    .isIn(['clothing', 'accessories', 'home', 'bags', 'shoes'])
    .withMessage('Product type must be one of: clothing, accessories, home, bags, shoes')
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

// Routes
router.post('/score', optionalAuth, scoreMaterialsValidation, scoreMaterials);
router.post('/compare', optionalAuth, compareMaterialsValidation, compareMaterials);
router.get('/history', authenticateToken, paginationValidation, getMaterialScoreHistory);

export default router;