const https = require('https');
const http = require('http');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const candidatureRoutes = require('./routes/candidatureRoutes');
const { protect } = require('./middleware/authMiddleware'); // Middleware di protezione
const whitelistMiddleware = require('./middleware/whitelistMiddleware'); // Middleware per la whitelist degli IP

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Configura il motore di visualizzazione come EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rotte di autenticazione
app.use('/api/auth', authRoutes);

// Rotte per le candidature con whitelist degli IP
app.use('/api/candidature', whitelistMiddleware, candidatureRoutes);

// Rotta protetta d'esempio con whitelist degli IP
app.get('/api/protected', whitelistMiddleware, protect, (req, res) => {
  res.status(200).json({ message: 'Benvenuto nella rotta protetta!' });
});

// Middleware di gestione errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

// Configurazione per HTTP in Sviluppo e HTTPS in Produzione
if (process.env.NODE_ENV === 'production') {
  const privateKey = fs.readFileSync('path/to/private-key.pem', 'utf8');
  const certificate = fs.readFileSync('path/to/certificate.pem', 'utf8');
  const credentials = { key: privateKey, cert: certificate };

  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
  });
} else {
  const httpServer = http.createServer(app);
  httpServer.listen(PORT, () => {
    console.log(`HTTP Server running on port ${PORT}`);
  });
}
