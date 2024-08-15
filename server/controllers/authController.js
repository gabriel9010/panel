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
        let user = await User.findOne({ $or: [{ username }, { email }] });
        
        if (user) {
            return res.status(400).json({ msg: 'User with this username or email already exists' });
        }
        
        user = new User({ username, email, password });
        await user.save();

        // Reindirizza alla pagina di login
        res.status(201).redirect('/login.html');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Login di un utente
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }
    
    try {
        let user = await User.findOne({ username });
        
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        
        const isMatch = await user.matchPassword(password);
        
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }, 
            (err, token) => {
                if (err) throw err;
                // Invia il token e reindirizza alla dashboard
                res.json({ token });
                res.redirect('/dashboard.html');  // Aggiungi questo per il reindirizzamento
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
