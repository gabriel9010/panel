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
exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validazione dei campi della richiesta
    const validationError = validateUserInput(username, email, password);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Controlla se l'utente o l'email esistono già
    const userExists = await User.findOne({ $or: [{ username }, { email }] });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this username or email' });
    }

    // Creazione dell'utente (la password viene hashata nel middleware del modello)
    const user = await User.create({ username, email, password: password.trim() });

    if (!user) {
      return res.status(400).json({ message: 'User creation failed.' });
    }

    // Risposta con il token JWT
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    next(error);
  }
};

// Login utente
exports.loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validazione dei campi della richiesta
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide both username and password.' });
    }

    // Trova l'utente in base al nome utente
    const user = await User.findOne({ username });

    if (!user) {
      console.log("Utente non trovato");
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Confronta la password
    const isPasswordMatch = await user.matchPassword(password.trim());

    if (!isPasswordMatch) {
      console.log("Password non corrisponde");
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Se l'autenticazione ha successo
    console.log("Login avvenuto con successo");
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Errore durante il login:', error);
    next(error);
  }
};

// Reset della password
exports.resetPassword = async (req, res, next) => {
  try {
    const { username } = req.body;

    // Trova l'utente in base al nome utente
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Genera una nuova password casuale
    const newPassword = Math.random().toString(36).slice(-8);

    // Aggiorna la password dell'utente (la nuova password verrà hashata automaticamente nel middleware del modello)
    user.password = newPassword.trim();
    await user.save();

    console.log('Nuova password generata e hashata:', user.password);

    // Risposta con la nuova password generata
    res.json({ message: `New password generated: ${newPassword}` });
  } catch (error) {
    console.error('Errore durante il reset della password:', error);
    next(error);
  }
};
