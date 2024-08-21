// middleware/whitelistMiddleware.js
const whitelist = ['192.168.1.1', '203.0.113.42']; // Inserisci qui gli IP autorizzati

module.exports = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;

  // Controlla se l'IP del richiedente è nella whitelist
  if (whitelist.includes(clientIp)) {
    next(); // IP autorizzato, passa al prossimo middleware
  } else {
    res.status(403).json({ message: 'Access denied: Your IP is not whitelisted.' });
  }
};
