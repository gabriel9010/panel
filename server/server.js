const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Servire i file statici dalla directory 'public'
app.use(express.static('public'));

// Rotta per la pagina home
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
