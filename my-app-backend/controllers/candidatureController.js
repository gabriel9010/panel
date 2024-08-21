const Candidature = require('../models/candidatureModel');
const axios = require('axios');

// Creazione di una nuova candidatura
exports.createCandidature = async (req, res) => {
  try {
    const { username, telegramId, answers } = req.body;

    // Controllo di validità dei dati
    if (!username || !telegramId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid input: username, telegramId, and answers are required and answers must be an array.' });
    }

    // Creazione della candidatura nel database
    const newCandidature = new Candidature({ username, telegramId, answers });
    await newCandidature.save();

    console.log(`Nuova candidatura salvata: ${newCandidature._id}`);

    res.status(201).json(newCandidature);
  } catch (error) {
    console.error('Errore durante la creazione della candidatura:', error);
    res.status(500).json({ message: 'Error creating candidature', error });
  }
};

// Recupero di tutte le candidature
exports.getAllCandidatures = async (req, res) => {
  try {
    const candidatures = await Candidature.find();
    res.status(200).json(candidatures);
  } catch (error) {
    console.error('Errore durante il recupero delle candidature:', error);
    res.status(500).json({ message: 'Error fetching candidatures', error });
  }
};

// Accettazione di una candidatura
exports.acceptCandidature = async (req, res) => {
  try {
    const { id } = req.params;

    // Controllo che la candidatura esista
    const candidature = await Candidature.findById(id);
    if (!candidature) {
      return res.status(404).json({ message: 'Candidature not found' });
    }

    // Aggiorna lo stato della candidatura ad "accepted"
    candidature.status = 'accepted';
    await candidature.save();

    console.log(`Candidatura accettata: ${candidature._id}`);

    // Invia il messaggio tramite il bot Telegram
    const botToken = process.env.BOT_TOKEN;
    const message = `Ciao ${candidature.username}, la tua candidatura è stata accettata! Benvenuto!`;
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // Invia il messaggio tramite Telegram
    try {
      await axios.post(telegramUrl, {
        chat_id: candidature.telegramId,
        text: message
      });
      console.log(`Messaggio Telegram inviato a ${candidature.telegramId}`);
    } catch (telegramError) {
      console.error(`Errore durante l'invio del messaggio Telegram a ${candidature.telegramId}:`, telegramError);
      return res.status(500).json({ message: 'Error sending Telegram message', error: telegramError });
    }

    // Restituisci la candidatura aggiornata come risposta
    res.status(200).json(candidature);
  } catch (error) {
    console.error('Errore durante l\'accettazione della candidatura:', error);
    res.status(500).json({ message: 'Error accepting candidature', error });
  }
};
