import express from 'express';
import { body } from 'express-validator';
import { signup, login, logout, getProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const signupValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('full_name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .trim(),
  body('sustainability_preferences')
    .optional()
    .isObject()
    .withMessage('Sustainability preferences must be an object')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/profile', authenticateToken, getProfile);

export default router;