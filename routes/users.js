const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET request for users list
router.get('/', userController.users_list);

// POST request for creating new user
router.post('/', userController.user_create);

// POST request for create new exercise
router.post('/:id/exercises', userController.exercises_create);

// GET request for user logs
router.get('/:id/logs', userController.logs_get);

module.exports = router;
