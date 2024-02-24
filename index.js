const createError = require('http-errors');
const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/users');
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

connectDB()
  .then(() => {
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log('Your app is listening on port ' + listener.address().port);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
