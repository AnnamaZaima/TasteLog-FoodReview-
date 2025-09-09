// server/routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be 2-100 characters')
    .trim(),
];

const loginValidation = [
  body('login')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const updateProfileValidation = [
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be 2-100 characters')
    .trim(),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
    .trim(),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, updateProfileValidation, authController.updateProfile);
router.put('/change-password', auth, changePasswordValidation, authController.changePassword);
router.post('/refresh-token', auth, authController.refreshToken);

module.exports = router;
