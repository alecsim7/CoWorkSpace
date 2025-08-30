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

/* ==== Proxy (CloudFront davanti) ==== */
app.set('trust proxy', 1);

/* ==== Rate limiting ==== */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

/* ==== CORS ==== */
const allowedOrigins = [
  'https://d1qgb2todm35gi.cloudfront.net', // produzione
  'http://localhost:3000',
  'http://127.0.0.1:5500'                   // sviluppo
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

/* ==== Rotte di servizio ==== */
// Healthcheck
app.get('/api/test', (_req, res) => {
  res.json({ message: '✅ Server attivo e raggiungibile' });
});

// Stripe publishable key (retrocompatibilità)
app.get('/config/stripe', (_req, res) => {
  res.json({ publishableKey: STRIPE_PUBLISHABLE_KEY });
});

// Stripe publishable key dietro /api (per CloudFront /api/*)
app.get('/api/config/stripe', (_req, res) => {
  res.json({ publishableKey: STRIPE_PUBLISHABLE_KEY });
});

/* ==== Rotte applicative ==== */
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

/* ==== Avvio ==== */
// HTTPS lo gestisce CloudFront: qui solo HTTP interno su 3000
http.createServer(app).listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server HTTP avviato su http://0.0.0.0:${PORT}`);
  console.log(`⚡ Usa CloudFront per accedere via HTTPS (es. https://d1qgb2todm35gi.cloudfront.net)`);
});