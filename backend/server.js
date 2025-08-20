const path = require('path');
const http = require('http');
// Carica variabili d'ambiente dal file .env
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();

const PORT = process.env.PORT || 3000;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

// ✅ Rate limiting per endpoint di autenticazione
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100
});

// ✅ Rate limiting per endpoint di pagamento
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// ✅ Middleware globali (CORS)
app.use(cors({
  origin: [
    'https://d1qgb2todm35gi.cloudfront.net', // dominio CloudFront (produzione)
    'http://localhost:3000',                 // test locale
  ],
  credentials: true
}));
app.use(express.json());

// ✅ Route di debug
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Server attivo e raggiungibile' });
});

// ✅ Route per ottenere la chiave pubblica Stripe
app.get('/config/stripe', (_, res) => {
  res.json({ publishableKey: STRIPE_PUBLISHABLE_KEY });
});

// ✅ Rotte API
app.use('/api', authLimiter, require('./routes/authRoutes'));           // Login, registrazione, logout
app.use('/api', require('./routes/userRoutes'));                        // Profilo utente
app.use('/api/sedi', require('./routes/sediRoutes'));
app.use('/api/spazi', require('./routes/spaziRoutes'));
app.use('/api/prenotazioni', require('./routes/prenotazioniRoutes'));
app.use('/api/pagamenti', paymentLimiter, require('./routes/pagamentiRoutes'));
app.use('/api/riepilogo', require('./routes/riepilogoRoutes'));
app.use('/api', require('./routes/gestoreRoutes'));                     // Dashboard gestore
app.use('/api/admin', require('./routes/adminRoutes'));                 // Area admin
app.use('/api', require('./routes/disponibilitaRoutes'));

// ✅ Avvio server SOLO HTTP (CloudFront fa da proxy HTTPS)
http.createServer(app).listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server HTTP avviato su http://0.0.0.0:${PORT}`);
  console.log(`⚡ Usa CloudFront per accedere via HTTPS`);
});