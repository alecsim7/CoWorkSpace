// server.js
const path = require('path');
const http = require('http');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

const PORT = process.env.PORT || 3000;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

/* =========================
   Rate limiting
   ========================= */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100,
});
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

/* =========================
   Middleware globali
   ========================= */
const allowedOrigins = [
  'https://d1qgb2todm35gi.cloudfront.net', // produzione (CloudFront)
  'http://localhost:3000',                 // sviluppo locale
];

// CORS: consenti solo gli origin sopra (con credenziali se servono cookie/sessions)
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Preflight per le route API
app.options('*', cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json());

/* =========================
   Rotte di servizio
   ========================= */
// Test/health
app.get('/api/test', (_req, res) => {
  res.json({ message: '✅ Server attivo e raggiungibile' });
});

// Stripe publishable key (vecchio path) – opzionale, manteniamo per retrocompatibilità
app.get('/config/stripe', (_req, res) => {
  res.json({ publishableKey: STRIPE_PUBLISHABLE_KEY });
});

// Stripe publishable key (NUOVO path dietro CloudFront /api/*)
app.get('/api/config/stripe', (_req, res) => {
  res.json({ publishableKey: STRIPE_PUBLISHABLE_KEY });
});

/* =========================
   Rotte applicative
   ========================= */
app.use('/api', authLimiter, require('./routes/authRoutes'));           // login, registrazione, logout
app.use('/api', require('./routes/userRoutes'));                        // profilo utente
app.use('/api/sedi', require('./routes/sediRoutes'));
app.use('/api/spazi', require('./routes/spaziRoutes'));
app.use('/api/prenotazioni', require('./routes/prenotazioniRoutes'));
app.use('/api/pagamenti', paymentLimiter, require('./routes/pagamentiRoutes'));
app.use('/api/riepilogo', require('./routes/riepilogoRoutes'));
app.use('/api', require('./routes/gestoreRoutes'));                     // dashboard gestore
app.use('/api/admin', require('./routes/adminRoutes'));                 // area admin
app.use('/api', require('./routes/disponibilitaRoutes'));

/* =========================
   Avvio (SOLO HTTP)
   ========================= */
// Niente HTTPS qui: lo gestisce CloudFront davanti. Il backend resta in HTTP interno su 3000.
http.createServer(app).listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server HTTP avviato su http://0.0.0.0:${PORT}`);
  console.log(`⚡ Usa CloudFront per accedere via HTTPS (es. https://d1qgb2todm35gi.cloudfront.net)`);
});