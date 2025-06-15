const Run = require('../models/Run');
const logger = require('../utils/logger');

// @desc    Get all runs
// @route   GET /api/v1/runs
// @access  Private
exports.getRuns = async (req, res, next) => {
  try {
    // Build query
    const query = { user: req.user.id };
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.date.$lte = new Date(req.query.endDate);
      }
    }

    // Filter by run type
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by surface
    if (req.query.surface) {
      query.surface = req.query.surface;
    }

    // Sorting
    let sort = '-date';
    if (req.query.sort) {
      sort = req.query.sort.split(',').join(' ');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Execute query
    const total = await Run.countDocuments(query);
    const runs = await Run.find(query)
      .sort(sort)
      .skip(startIndex)
      .limit(limit);

    // Build pagination result
    const pagination = {};
    const endIndex = page * limit;
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: runs.length,
      pagination,
      data: runs,
    });
  } catch (err) {
    logger.error(`Get runs error: ${err.message}`);
    next(err);
  }
};

// @desc    Get single run
// @route   GET /api/v1/runs/:id
// @access  Private
exports.getRun = async (req, res, next) => {
  try {
    const run = await Run.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!run) {
      return res.status(404).json({
        success: false,
        error: 'Run not found',
      });
    }

    res.status(200).json({
      success: true,
      data: run,
    });
  } catch (err) {
    logger.error(`Get run error: ${err.message}`);
    next(err);
  }
};

// @desc    Create run
// @route   POST /api/v1/runs
// @access  Private
exports.createRun = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const run = await Run.create(req.body);

    res.status(201).json({
      success: true,
      data: run,
    });
  } catch (err) {
    logger.error(`Create run error: ${err.message}`);
    next(err);
  }
};

// @desc    Update run
// @route   PUT /api/v1/runs/:id
// @access  Private
exports.updateRun = async (req, res, next) => {
  try {
    let run = await Run.findById(req.params.id);

    if (!run) {
      return res.status(404).json({
        success: false,
        error: 'Run not found',
      });
    }

    // Make sure user is run owner
    if (run.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'User not authorized to update this run',
      });
    }

    run = await Run.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: run,
    });
  } catch (err) {
    logger.error(`Update run error: ${err.message}`);
    next(err);
  }
};

// @desc    Delete run
// @route   DELETE /api/v1/runs/:id
// @access  Private
exports.deleteRun = async (req, res, next) => {
  try {
    const run = await Run.findById(req.params.id);

    if (!run) {
      return res.status(404).json({
        success: false,
        error: 'Run not found',
      });
    }

    // Make sure user is run owner
    if (run.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'User not authorized to delete this run',
      });
    }

    await run.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    logger.error(`Delete run error: ${err.message}`);
    next(err);
  }
};

// @desc    Get run stats
// @route   GET /api/v1/runs/stats
// @access  Private
exports.getRunStats = async (req, res, next) => {
  try {
    const stats = await Run.aggregate([
      {
        $match: {
          user: req.user._id,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$date' },
          },
          count: { $sum: 1 },
          totalDistance: { $sum: '$distance' },
          totalDuration: { $sum: '$duration' },
          avgPace: { $avg: { $divide: ['$duration', { $divide: ['$distance', 1000] }] } },
          avgHr: { $avg: '$avgHr' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    logger.error(`Get run stats error: ${err.message}`);
    next(err);
  }
};
