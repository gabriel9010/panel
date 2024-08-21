const mongoose = require('mongoose');

// Connessione al database MongoDB
const connectDB = async () => {
  try {
    // Connetti a MongoDB utilizzando l'URI specificato nelle variabili d'ambiente
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Termina il processo in caso di errore
  }
};

module.exports = connectDB;
