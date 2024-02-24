const createError = require('http-errors');
const express = require('express');
const app = express();
const cors = require('cors');
const logger = require('morgan');
const helmet = require('helmet');
const userRoutes = require('./routes/users');
require('dotenv').config();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.use('/api/users', userRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // only providing error in development
  if (req.app.get('env') === 'development') {
    console.error(err);
  }

  // handle validation errors
  if (err.errors) {
    res.status(err.status || 400);
    return res.json({
      errors: err.errors,
    });
  }

  // return the error
  res.status(err.status || 500);
  res.json({
    error: err.message || 'error',
  });
});

module.exports = app;
