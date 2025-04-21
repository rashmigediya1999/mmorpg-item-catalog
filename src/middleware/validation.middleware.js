import { body, query, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation error',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  next();
};

export const validateItem = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
  
  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),
  handleValidationErrors
];

export const validateCategory = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ max: 50 }).withMessage('Name must be at most 50 characters'),
  // ...existing validation rules...
  handleValidationErrors
];

export const validateUser = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isString().withMessage('Username must be a string')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  handleValidationErrors
];

export const validateLogin = [
  body('username')
    .notEmpty().withMessage('Username is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

export const validateInventoryItem = [
  body('itemid')
    .notEmpty().withMessage('Item ID is required')
    .isInt({ min: 1 }).withMessage('Item ID must be a positive integer'),
  handleValidationErrors
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 0 }).withMessage('Page must be a non-negative integer'),
  query('size')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Size must be between 1 and 100'),
  handleValidationErrors
];