const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const dotenv = require('dotenv');

dotenv.config();
connectDB();

const app = express();

// Abilita CORS per tutte le rotte
app.use(cors());

// Middleware per gestire i JSON nel body delle richieste
app.use(express.json());

// Rotte di autenticazione
app.use('/api/auth', authRoutes);

// Middleware di gestione errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
