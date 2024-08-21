const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Genera il token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Funzione per validare i campi della richiesta
const validateUserInput = (username, email, password) => {
  if (!username || !email || !password) {
    return 'Please provide all fields (username, email, password)';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  return null;
};

// Registrazione utente
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validazione degli input
    const validationError = validateUserInput(username, email, password);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Controlla se l'utente esiste già
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this username or email' });
    }

    // Crea un nuovo utente
    const user = await User.create({ username, email, password: password.trim() });

    if (!user) {
      return res.status(400).json({ message: 'User creation failed.' });
    }

    // Risposta con i dettagli dell'utente e il token JWT
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login utente
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verifica che username e password siano forniti
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide both username and password.' });
    }

    // Cerca l'utente nel database
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Verifica la corrispondenza della password
    const isPasswordMatch = await user.matchPassword(password.trim());
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Risposta con i dettagli dell'utente e il token JWT
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Errore durante il login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Recupera il profilo utente basato sul token JWT
exports.getUserProfile = async (req, res) => {
  try {
    // Trova l'utente nel database basato sull'ID del token JWT
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Risposta con i dettagli del profilo utente
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error('Errore durante il recupero del profilo utente:', error);
    res.status(500).json({ message: 'Server error during profile retrieval' });
  }
};

// Reset della password
exports.resetPassword = async (req, res) => {
  try {
    const { username } = req.body;

    // Cerca l'utente nel database tramite username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Genera una nuova password casuale
    const newPassword = Math.random().toString(36).slice(-8);

    // Aggiorna la password dell'utente
    user.password = newPassword.trim();
    await user.save();

    // Risposta con la nuova password generata
    res.json({ message: `New password generated: ${newPassword}` });
  } catch (error) {
    console.error('Errore durante il reset della password:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};
