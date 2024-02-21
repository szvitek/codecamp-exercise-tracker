const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';

  try {
    await mongoose.connect(url);
    console.log(`Database connected: ${url}`);
  } catch (err) {
    console.error(`Connection error: ${err}`);
    process.exit(1);
  }
};
