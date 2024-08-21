const mongoose = require('mongoose');

const candidatureSchema = new mongoose.Schema({
  username: { type: String, required: true },
  telegramId: { type: String, required: true },
  answers: { type: [String], required: true },
  status: { type: String, default: 'pending' }, // Stato: pending, accepted, rejected
  createdAt: { type: Date, default: Date.now }
});

const Candidature = mongoose.model('Candidature', candidatureSchema);
module.exports = Candidature;
