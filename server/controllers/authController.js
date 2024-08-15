const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Registrazione di un nuovo utente
exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    
    // Validazione dei campi
    if (!username || !email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        // Verifica se l'utente esiste già tramite username o email
        let user = await User.findOne({ $or: [{ username }, { email }] });
        
        if (user) {
            return res.status(400).json({ msg: 'User with this username or email already exists' });
        }
        
        // Crea un nuovo utente
        user = new User({ username, email, password });
        await user.save();
        
        // Crea il payload per il token JWT
        const payload = {
            user: {
                id: user.id
            }
        };
        
        // Firma il token e invia la risposta
        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }, 
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Login di un utente
exports.login = async (req, res) => {
    const { username, password } = req.body;

    // Validazione dei campi
    if (!username || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }
    
    try {
        // Verifica se l'utente esiste tramite username
        let user = await User.findOne({ username });
        
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        
        // Verifica la password
        const isMatch = await user.matchPassword(password);
        
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        
        // Crea il payload per il token JWT
        const payload = {
            user: {
                id: user.id
            }
        };
        
        // Firma il token e invia la risposta
        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }, 
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Recupera i dettagli dell'utente autenticato
exports.getUser = async (req, res) => {
    try {
        // Trova l'utente tramite l'ID nel token, escludendo il campo password
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
