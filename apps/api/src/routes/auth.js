const express = require('express');
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// @route   POST /api/v1/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
    check('displayName', 'Please add a name').not().isEmpty(),
  ],
  authController.register
);

// @route   POST /api/v1/auth/login
// @desc    Login user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  authController.login
);

// @route   GET /api/v1/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', auth, authController.getMe);

// @route   PUT /api/v1/auth/updatedetails
// @desc    Update user details
// @access  Private
router.put(
  '/updatedetails',
  [
    auth,
    check('displayName', 'Please add a name').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
  ],
  authController.updateDetails
);

// @route   PUT /api/v1/auth/updatepassword
// @desc    Update password
// @access  Private
router.put(
  '/updatepassword',
  [
    auth,
    check('currentPassword', 'Please enter current password').exists(),
    check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  authController.updatePassword
);

// @route   GET /api/v1/auth/logout
// @desc    Log user out / clear cookie
// @access  Private
router.get('/logout', auth, authController.logout);

module.exports = router;
