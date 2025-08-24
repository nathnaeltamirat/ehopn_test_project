import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  next();
};

export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('language')
    .isIn(['en', 'de', 'ar'])
    .withMessage('Language must be en, de, or ar'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateInvoice = [
  body('vendor')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Vendor must be between 1 and 200 characters'),
  body('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('amount')
    .matches(/^\d+(\.\d{1,2})?$/)
    .withMessage('Amount must be a valid number with up to 2 decimal places'),
  body('taxId')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tax ID must be between 1 and 50 characters'),
  handleValidationErrors
];

export const validateSubscription = [
  body('plan')
    .isIn(['Free', 'Pro', 'Business'])
    .withMessage('Plan must be Free, Pro, or Business'),
  handleValidationErrors
];

export const validateLanguage = [
  body('language')
    .isIn(['en', 'de', 'ar'])
    .withMessage('Language must be en, de, or ar'),
  handleValidationErrors
];

export const validateProfile = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
    .withMessage('Password confirmation does not match'),
  handleValidationErrors
];

export const validateDeleteAccount = [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account'),
  handleValidationErrors
];
