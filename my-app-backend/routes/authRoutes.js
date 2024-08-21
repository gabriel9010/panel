const express = require('express');
const { registerUser, loginUser, resetPassword, getUserProfile } = require('../controllers/authController');
const { logoutUser } = require('../controllers/logoutController'); // Se hai una funzione logout
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/reset-password', resetPassword);

// Rotta protetta per ottenere il profilo dell'utente
router.get('/user', protect, getUserProfile);

module.exports = router;
