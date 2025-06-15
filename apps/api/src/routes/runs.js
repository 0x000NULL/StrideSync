const express = require('express');
const { check } = require('express-validator');
const { protect } = require('../middleware/auth');
const runController = require('../controllers/run.controller');

const router = express.Router();

// All routes are protected by authentication
router.use(protect);

// @route   GET /api/v1/runs/stats
// @desc    Get run statistics
// @access  Private
router.get('/stats', runController.getRunStats);

// @route   GET /api/v1/runs
// @desc    Get all runs for logged in user
// @access  Private
router.get(
  '/',
  [
    // Add any additional validation if needed
  ],
  runController.getRuns
);

// @route   GET /api/v1/runs/:id
// @desc    Get single run
// @access  Private
router.get('/:id', runController.getRun);

// @route   POST /api/v1/runs
// @desc    Create new run
// @access  Private
router.post(
  '/',
  [
    check('date', 'Please include a valid date').isISO8601(),
    check('distance', 'Please include a valid distance').isNumeric(),
    check('duration', 'Please include a valid duration in seconds').isNumeric(),
    check('type', 'Please include a valid run type').isIn([
      'easy',
      'tempo',
      'interval',
      'long',
      'race',
      'recovery',
      'other',
    ]),
  ],
  runController.createRun
);

// @route   PUT /api/v1/runs/:id
// @desc    Update run
// @access  Private
router.put(
  '/:id',
  [
    check('date', 'Please include a valid date')
      .optional()
      .isISO8601(),
    check('distance', 'Please include a valid distance')
      .optional()
      .isNumeric(),
    check('duration', 'Please include a valid duration in seconds')
      .optional()
      .isNumeric(),
    check('type', 'Please include a valid run type')
      .optional()
      .isIn(['easy', 'tempo', 'interval', 'long', 'race', 'recovery', 'other']),
  ],
  runController.updateRun
);

// @route   DELETE /api/v1/runs/:id
// @desc    Delete run
// @access  Private
router.delete('/:id', runController.deleteRun);

module.exports = router;
