// controllers/logoutController.js
exports.logoutUser = (req, res) => {
    // Poiché stai utilizzando JWT, il logout avviene lato client rimuovendo il token
    res.status(200).json({ message: 'User logged out successfully' });
  };
  