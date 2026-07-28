const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware to check for validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: errors.array() 
    });
  }
  next();
};

/**
 * Sanitize input to prevent XSS attacks
 */
const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  // Sanitize query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }
  next();
};

/**
 * Common validation rules
 */
const validationRules = {
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
    body('first_name').trim().notEmpty().withMessage('First name required'),
    body('last_name').trim().notEmpty().withMessage('Last name required'),
    body('role_id').isUUID().withMessage('Valid role ID required'),
    body('school_id').isUUID().withMessage('Valid school ID required')
  ],
  
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  
  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('newPassword').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/).withMessage('Password must contain uppercase, lowercase, number, and special character'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
  ],
  
  forgotPassword: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required')
  ],
  
  resetPassword: [
    body('token').notEmpty().withMessage('Reset token required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/).withMessage('Password must contain uppercase, lowercase, number, and special character'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
  ],
  
  uuidParam: [
    param('id').isUUID().withMessage('Valid UUID required')
  ],
  
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],

  // Message validation
  sendMessage: [
    body('receiver_id').isUUID().withMessage('Valid receiver ID required'),
    body('content').trim().notEmpty().withMessage('Message content required'),
    body('content').isLength({ max: 5000 }).withMessage('Message too long (max 5000 characters)')
  ],

  // Announcement validation
  createAnnouncement: [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('title').isLength({ max: 200 }).withMessage('Title too long (max 200 characters)'),
    body('content').trim().notEmpty().withMessage('Content required'),
    body('content').isLength({ max: 10000 }).withMessage('Content too long (max 10000 characters)'),
    body('target_audience').optional().isObject().withMessage('Target audience must be an object')
  ],

  // Student validation
  createStudent: [
    body('user_id').isUUID().withMessage('Valid user ID required'),
    body('class_id').optional().isUUID().withMessage('Valid class ID required'),
    body('grade_id').optional().isUUID().withMessage('Valid grade ID required'),
    body('division_id').optional().isUUID().withMessage('Valid division ID required'),
    body('student_id').trim().notEmpty().withMessage('Student ID required')
  ]
};

module.exports = { validate, validationRules, sanitizeInput };
