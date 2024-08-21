const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const candidatureRoutes = require('./routes/candidatureRoutes');
const { protect } = require('./middleware/authMiddleware'); // Middleware di protezione
const whitelistMiddleware = require('./middleware/whitelistMiddleware'); // Middleware per la whitelist degli IP

// Carica le variabili d'ambiente
dotenv.config();

// Connessione al database
connectDB();

const app = express();

// Middleware per gestire JSON e CORS
app.use(cors());
app.use(express.json());

// Configura il motore di visualizzazione come EJS (se necessario per altre pagine)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configurazione della cartella statica per servire file HTML, CSS, JS, ecc.
app.use(express.static(path.join(__dirname, 'public')));

// Rotta per servire la pagina home.html alla root "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html')); // Servire home.html
});

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

// Imposta la porta per il server HTTP
const PORT = process.env.PORT || 5000;

// Configurazione per il server HTTP
const httpServer = http.createServer(app);

// Avvia il server HTTP
httpServer.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});
