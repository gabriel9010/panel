const express = require('express');
const { createCandidature, getAllCandidatures, acceptCandidature } = require('../controllers/candidatureController');
const router = express.Router();

router.post('/', createCandidature); // Creazione di una candidatura
router.get('/', getAllCandidatures); // Recupero di tutte le candidature
router.put('/:id/accept', acceptCandidature); // Accettazione di una candidatura

module.exports = router;
