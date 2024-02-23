const express = require('express');
const router = express.Router();
const Users = require('../models/user');
const asyncHandler = require('express-async-handler');
const { model: Exercise } = require('../models/exercise');

// todo: abstract find/validate user
// todo: create controllers
// todo: logging/debuging?

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const users = await Users.find({}, '-log');
    return res.json(users);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.json({
        error: 'username is required',
      });
    }

    // not necesarry need to be unique, but it is now... (:
    const existingUser = await Users.findOne({ username });
    if (existingUser) {
      return res.json({
        error: 'username is already taken!',
      });
    }

    const user = await Users.create({ username });

    return res.json({
      _id: user._id,
      username: user.username,
    });
  })
);

router.post(
  '/:id/exercises',
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { description, duration, date } = req.body;

    const user = await Users.findById(userId);

    if (!user) {
      return res.json({
        error: 'invalid user',
      });
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
  })
);

router.get(
  '/:id/logs',
  asyncHandler(async (req, res) => {
    const { from, to, limit = 0 } = req.query;
    const userId = req.params.id;
    const user = await Users.findById(userId);

    if (!user) {
      return res.json({
        error: 'invalid user',
      });
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
  })
);

module.exports = router;
