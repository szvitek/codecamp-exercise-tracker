const express = require('express');
const router = express.Router();
const users = require('../models/user');

router.get('/', async (req, res) => {
  const u = await users.find();

  return res.json(u);
});

router.post('/', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.json({
      error: 'username is required',
    });
  }

  const existingUser = await users.findOne({ username });
  if (existingUser) {
    return res.json({
      error: 'username is already taken!',
    });
  }

  const user = await users.create({ username });

  return res.json(user);
});

module.exports = router;
