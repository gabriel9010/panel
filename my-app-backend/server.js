const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const candidatureRoutes = require('./routes/candidatureRoutes');
const { protect } = require('./middleware/authMiddleware');
const whitelistMiddleware = require('./middleware/whitelistMiddleware');

dotenv.config();
connectDB();

const app = express();

// Middleware per gestire JSON e CORS
app.use(cors());
app.use(express.json());

// Configurazione della cartella statica
app.use(express.static(path.join(__dirname, 'public')));

// Rotta per servire la pagina home.html alla root "/"
app.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'), (err) => {
    if (err) {
      next(err);
    }
  });
});

// Prefisso per tutte le API
app.use('/api/auth', authRoutes);
app.use('/api/candidature', whitelistMiddleware, candidatureRoutes);

// Rotta protetta d'esempio con whitelist degli IP
app.get('/api/protected', whitelistMiddleware, protect, (req, res) => {
  res.status(200).json({ message: 'Benvenuto nella rotta protetta!' });
});

// Middleware di gestione degli errori
app.use((err, req, res, next) => {
  console.error("Errore nel middleware:", err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Imposta la porta per il server HTTP
const PORT = process.env.PORT || 5000;

// Configurazione per il server HTTP
const httpServer = http.createServer(app);

// Avvia il server HTTP
httpServer.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});
