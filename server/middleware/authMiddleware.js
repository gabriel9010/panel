const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Estrai il token dall'header
    const token = req.header('x-auth-token');
    
    // Controlla se il token esiste
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    
    try {
        // Verifica il token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
