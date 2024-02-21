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
