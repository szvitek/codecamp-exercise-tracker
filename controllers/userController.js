const Users = require('../models/user');
const { model: Exercise } = require('../models/exercise');
const asyncHandler = require('express-async-handler');
const { body, param, query, validationResult } = require('express-validator');

// todo: logging/debuging?

exports.users_list = asyncHandler(async (req, res, next) => {
  const users = await Users.find({}, '-log');
  return res.json(users);
});

exports.user_create = [
  body('username')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Username is required.'),

  // Process request after validation
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next({
        errors: errors.array(),
      });
    } else {
      const { username } = req.body;

      // not necesarry need to be unique, but it is now... (:
      const existingUser = await Users.findOne({ username });
      if (existingUser) {
        const err = new Error('username is already taken');
        err.status = 400;
        return next(err);
      }

      const user = await Users.create({ username });

      return res.json({
        _id: user._id,
        username: user.username,
      });
    }
  }),
];

exports.exercises_create = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('description is required.'),
  body('duration')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isInt()
    .toInt()
    .withMessage('duration is required.'),
  body('date')
    .trim()
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .withMessage('invalid date.'),

  // Process request after validation
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next({
        errors: errors.array(),
      });
    } else {
      const userId = req.params.id;
      const { description, duration, date } = req.body;

      const user = await Users.findById(userId);

      if (!user) {
        const err = new Error('user not found');
        err.status = 400;
        return next(err);
      }

      const rawDate = date ? new Date(date) : new Date();

      const exercice = await Exercise.create({
        userId: user._id,
        description,
        duration,
        rawDate,
      });

      return res.json({
        username: user.username,
        description: exercice.description,
        duration: exercice.duration,
        date: exercice.date,
        _id: user._id,
      });
    }
  }),
];

exports.logs_get = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  query('from')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('invalid from date'),
  query('to').optional().isISO8601().toDate().withMessage('invalid to date'),
  query('limit').optional().isInt(),

  // Process request after validation
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next({
        errors: errors.array(),
      });
    } else {
      const { from, to, limit = 0 } = req.query;
      const userId = req.params.id;
      const user = await Users.findById(userId);

      if (!user) {
        const err = new Error('user not found');
        err.status = 400;
        return next(err);
      }

      const dateFilter = {};
      if (from) {
        dateFilter['$gte'] = new Date(from);
      }
      if (to) {
        dateFilter['$lte'] = new Date(to);
      }

      const filter = {
        userId: user._id,
      };

      if (from || to) {
        filter.rawDate = dateFilter;
      }

      const exercises = await Exercise.find(filter)
        .sort({ rawDate: 'asc' })
        .limit(+limit);
      const log = exercises.map(({ description, duration, date }) => ({
        description,
        duration,
        date,
      }));

      return res.json({
        _id: user._id,
        username: user.username,
        count: exercises.length,
        log,
      });
    }
  }),
];
