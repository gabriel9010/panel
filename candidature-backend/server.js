require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
const port = process.env.PORT || 3000;

// Configura il bot Telegram
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// Parsing della whitelist degli IP dal file .env
const whitelist = process.env.WHITELIST_IPS.split(',');

// Middleware per gestire il parsing dei JSON
app.use(express.json());
app.use(cors());

// Middleware per servire file statici e applicare la whitelist solo per il frontend
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    const clientIp = req.ip || req.connection.remoteAddress;
    console.log(`Tentativo di accesso da IP: ${clientIp}`);
    if (whitelist.includes(clientIp)) {
      next();
    } else {
      res.status(403).send('Accesso negato: il tuo IP non è autorizzato.');
    }
  } else {
    next();
  }
});

// Connessione a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connesso a MongoDB'))
  .catch(err => {
    console.error('Errore di connessione a MongoDB...', err);
    process.exit(1); // Termina il processo se non può connettersi a MongoDB
  });

// Servire i file statici del frontend
app.use(express.static(path.join(__dirname, 'public')));

// Schema della candidatura
const candidaturaSchema = new mongoose.Schema({
  username: String,
  telegramId: String,
  answers: [String],
  status: { type: String, default: 'In attesa' }
});

const Candidatura = mongoose.model('Candidatura', candidaturaSchema);

// Rotta per ottenere tutte le candidature (GET)
app.get('/api/candidature', async (req, res) => {
  try {
    const candidatures = await Candidatura.find();
    res.status(200).json(candidatures);
  } catch (error) {
    console.error('Errore durante il recupero delle candidature:', error);
    res.status(500).send('Errore durante il recupero delle candidature');
  }
});

// Rotta per inviare una nuova candidatura (POST)
app.post('/api/candidature', async (req, res) => {
  try {
    console.log('Ricevuta candidatura:', req.body); // Logging per verificare i dati ricevuti
    const candidatura = new Candidatura(req.body);
    await candidatura.save();
    res.status(201).send('Candidatura inviata con successo');
  } catch (error) {
    console.error('Errore durante l\'invio della candidatura:', error);
    res.status(400).send('Errore nell\'invio della candidatura');
  }
});

// Rotta per accettare una candidatura (PUT)
app.put('/api/candidature/:id/accept', async (req, res) => {
  try {
    const candidatura = await Candidatura.findByIdAndUpdate(req.params.id, { status: 'Accettata' }, { new: true });

    if (!candidatura) {
      return res.status(404).send('Candidatura non trovata');
    }

    // Invia messaggio su Telegram
    const message = `🎉 Complimenti, ${candidatura.username}! La tua candidatura è stata accettata. Benvenuto nel team!`;
    bot.sendMessage(candidatura.telegramId, message);

    res.status(200).json(candidatura);
  } catch (error) {
    console.error('Errore durante l\'aggiornamento della candidatura:', error);
    res.status(500).send('Errore durante l\'aggiornamento della candidatura');
  }
});

// Rotta per eliminare una candidatura (DELETE)
app.delete('/api/candidature/:id', async (req, res) => {
  try {
    await Candidatura.findByIdAndDelete(req.params.id);
    res.status(200).send('Candidatura eliminata');
  } catch (error) {
    console.error('Errore durante l\'eliminazione della candidatura:', error);
    res.status(500).send('Errore durante l\'eliminazione della candidatura');
  }
});

// Nuova rotta per contare candidature lette e non lette (GET)
app.get('/api/candidature/count', async (req, res) => {
  try {
    const unreadCount = await Candidatura.countDocuments({ status: 'In attesa' });
    const readCount = await Candidatura.countDocuments({ status: 'Accettata' });

    res.status(200).json({
      unread: unreadCount,
      read: readCount
    });
  } catch (error) {
    console.error('Errore durante il conteggio delle candidature:', error);
    res.status(500).send('Errore durante il conteggio delle candidature');
  }
});

// Catch-all per servire l'index.html per tutte le richieste non API (Single Page Applications)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Avvio del server
app.listen(port, () => {
  console.log(`Server in esecuzione su http://localhost:${port}`);
});
