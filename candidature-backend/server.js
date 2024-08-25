require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
const ipRangeCheck = require("ip-range-check");

const app = express();
const server = http.createServer(app); // Crea un server HTTP
const io = socketIo(server); // Inizializza Socket.io sul server
const port = process.env.PORT || 3000;

// Configura il bot Telegram
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// Parsing della whitelist degli IP dal file .env
const whitelist = process.env.WHITELIST_IPS.split(',');

// Middleware per gestire il parsing dei JSON
app.use(express.json());
app.use(cors());

// Middleware per verificare l'IP contro la whitelist
app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const ipToCheck = clientIp.includes("::ffff:") ? clientIp.split("::ffff:")[1] : clientIp;

  console.log(`Tentativo di accesso da IP: ${ipToCheck}`);

  if (whitelist.includes(ipToCheck) || ipRangeCheck(ipToCheck, whitelist)) {
    next();
  } else {
    res.status(403).send('Accesso negato: il tuo IP non è autorizzato.');
  }
});

// Connessione a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connesso a MongoDB'))
  .catch(err => {
    console.error('Errore di connessione a MongoDB...', err);
    process.exit(1);
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

// Funzione per inviare aggiornamenti delle candidature a tutti i client
const sendCandidatureCounts = async () => {
  const unreadCount = await Candidatura.countDocuments({ status: 'In attesa' });
  const readCount = await Candidatura.countDocuments({ status: 'Accettata' });
  io.emit('candidatureCounts', { unread: unreadCount, read: readCount });
};

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
    const candidatura = new Candidatura(req.body);
    await candidatura.save();
    sendCandidatureCounts();  // Aggiorna i client in tempo reale
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

    bot.sendMessage(candidatura.telegramId, `🎉 Complimenti, ${candidatura.username}! La tua candidatura è stata accettata. Benvenuto nel team!`);
    sendCandidatureCounts();  // Aggiorna i client in tempo reale
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
    sendCandidatureCounts();  // Aggiorna i client in tempo reale
    res.status(200).send('Candidatura eliminata');
  } catch (error) {
    console.error('Errore durante l\'eliminazione della candidatura:', error);
    res.status(500).send('Errore durante l\'eliminazione della candidatura');
  }
});

// Catch-all per servire l'index.html per tutte le richieste non API (Single Page Applications)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Avvio del server
server.listen(port, '0.0.0.0', () => {
  console.log(`Server in esecuzione su http://0.0.0.0:${port}`);
});
