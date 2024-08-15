const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connetti a MongoDB senza opzioni obsolete
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Termina il processo se la connessione fallisce
    process.exit(1);
  }
};

module.exports = connectDB;
