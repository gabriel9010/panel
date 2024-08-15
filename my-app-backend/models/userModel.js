const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    trim: true, 
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'] // Migliorata regex per email
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'], 
    minlength: 6 
  }
});

// Middleware per hashare la password prima di salvare
userSchema.pre('save', async function (next) {
    // Controlla se la password è stata modificata
    if (!this.isModified('password')) {
      console.log('Password non modificata, skip hashing.');
      return next();
    }
  
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      console.log('Password hashata prima del salvataggio:', this.password); // Log per debugging
      next();
    } catch (error) {
      console.error('Errore durante il hashing della password:', error);
      next(error);
    }
  });

// Metodo per confrontare la password inserita con quella hashata
userSchema.methods.matchPassword = async function (enteredPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  console.log(`Password confrontata: ${enteredPassword}, hash nel database: ${this.password}, risultato: ${isMatch}`); // Log per debugging
  return isMatch;
};

// Modello utente
const User = mongoose.model('User', userSchema);

module.exports = User;
