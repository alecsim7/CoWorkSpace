// server.js - Entry point dell'applicazione backend CoWorkSpace

// Importa moduli core e di terze parti
const path = require('path');
const http = require('http');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Configurazione delle variabili d'ambiente e costanti globali
const PORT = process.env.PORT || 3000;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

/* ==== Proxy (CloudFront davanti) ==== */
// Imposta Express per fidarsi dell'header X-Forwarded-* (necessario se dietro proxy come CloudFront)
app.set('trust proxy', 1);

/* ==== Rate limiting ==== */
// Limita il numero di richieste per endpoint di autenticazione
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Finestra di 15 minuti
  max: 100,                  // Max 100 richieste per IP
  standardHeaders: true,
  legacyHeaders: false,
});
// Limita il numero di richieste per endpoint di pagamento
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

/* ==== CORS ==== */
// Definisce gli origin consentiti per le richieste cross-origin
const allowedOrigins = [
  'https://d1qgb2todm35gi.cloudfront.net', // produzione
  'http://localhost:3000',
  'http://127.0.0.1:5500'                   // sviluppo
];

// Applica la configurazione CORS con controllo sugli origin
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Abilita la ricezione di payload JSON nelle richieste
app.use(express.json());

// Endpoint di health per verificare lo stato del server (usato nei deploy)
app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, ts: Date.now() });
});

// Alias di compatibilità per vecchie chiamate a /login, instrada verso /api/login
app.options('/login', (_req, res) => res.sendStatus(204));
app.all('/login', (req, _res, next) => {
  req.url = '/api/login';
  next();
});

/* ==== Rotte di servizio ==== */
// Healthcheck per test manuali
app.get('/api/test', (_req, res) => {
  res.json({ message: '✅ Server attivo e raggiungibile' });
});

// Restituisce la chiave pubblica Stripe (retrocompatibilità)
app.get('/config/stripe', (_req, res) => {
  res.json({ publishableKey: STRIPE_PUBLISHABLE_KEY });
});

// Restituisce la chiave pubblica Stripe sotto /api (per CloudFront /api/*)
app.get('/api/config/stripe', (_req, res) => {
  res.json({ publishableKey: STRIPE_PUBLISHABLE_KEY });
});

/* ==== Rotte applicative ==== */
// Rotte per autenticazione (login, registrazione, logout) con rate limiting
app.use('/api', authLimiter, require('./routes/authRoutes'));           
// Rotte per gestione profilo utente
app.use('/api', require('./routes/userRoutes'));                        
// Rotte per gestione sedi
app.use('/api/sedi', require('./routes/sediRoutes'));
// Rotte per gestione spazi
app.use('/api/spazi', require('./routes/spaziRoutes'));
// Rotte per gestione prenotazioni
app.use('/api/prenotazioni', require('./routes/prenotazioniRoutes'));
// Rotte per pagamenti con rate limiting dedicato
app.use('/api/pagamenti', paymentLimiter, require('./routes/pagamentiRoutes'));
// Rotte per riepilogo prenotazioni/pagamenti
app.use('/api/riepilogo', require('./routes/riepilogoRoutes'));
// Rotte per dashboard gestore
app.use('/api', require('./routes/gestoreRoutes'));                     
// Rotte per area admin
app.use('/api/admin', require('./routes/adminRoutes'));                 
// Rotte per gestione disponibilità spazi
app.use('/api', require('./routes/disponibilitaRoutes'));

/* ==== Avvio ==== */
// Avvia il server HTTP sulla porta specificata.
// HTTPS è gestito da CloudFront, qui solo HTTP interno su 3000.
http.createServer(app).listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server HTTP avviato su http://0.0.0.0:${PORT}`);
  console.log(`⚡ Usa CloudFront per accedere via HTTPS (es. https://d1qgb2todm35gi.cloudfront.net)`);
});