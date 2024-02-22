const express = require('express');
const router = express.Router();
const Users = require('../models/user');
const { model: Exercise } = require('../models/exercise');

// todo: refactor try/catch blocks
// todo: abstract find/validate user
// todo: better error handling

router.get('/', async (req, res) => {
  try {
    const users = await Users.find({}, '-log');
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.json({
      error: error.message || 'error',
    });
  }
});

router.post('/', async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    return res.json({
      error: error.message || 'error creating user',
    });
  }
});

router.post('/:id/exercises', async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    return res.json({
      error: error.message || 'error creating exercise',
    });
  }
});

router.get('/:id/logs', async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    return res.json({
      error: error.message || 'error getting logs',
    });
  }
});

module.exports = router;
