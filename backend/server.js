const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Debug route to test if endpoint is accessible
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Rotte
app.get('/', (_, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));
app.use('/api', authLimiter, require('./routes/authRoutes'));           // Login, registrazione, logout
app.use('/api', require('./routes/userRoutes'));           // Profilo utente
app.use('/api/sedi', require('./routes/sediRoutes'));
app.use('/api/spazi', require('./routes/spaziRoutes'));
const prenotazioniRoutes = require('./routes/prenotazioniRoutes');
const pagamentiRoutes = require('./routes/pagamentiRoutes');

app.use('/api/prenotazioni', prenotazioniRoutes);
app.use('/api/pagamenti', paymentLimiter, pagamentiRoutes);
app.use('/api/riepilogo', require('./routes/riepilogoRoutes'));
app.use('/api', require('./routes/gestoreRoutes'));        // Dashboard gestore
app.use('/api/admin', require('./routes/adminRoutes'));    // Area admin
app.use('/api', require('./routes/disponibilitaRoutes'));


// Avvio server
app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
});
