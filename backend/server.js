const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();
const HTTP_PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const PORT = process.env.PORT || 3000;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;


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

// Configurazione Stripe
app.get('/config/stripe', (_, res) => {
  res.json({ publishableKey: STRIPE_PUBLISHABLE_KEY });
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


// Avvio server con verifica dei certificati SSL
const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, 'cert', 'key.pem');
const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, 'cert', 'cert.pem');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
    console.log(`🚀 Server HTTPS avviato su https://localhost:${HTTPS_PORT}`);
  });

  // Redirect HTTP -> HTTPS
  http.createServer((req, res) => {
    const host = req.headers.host.split(':')[0];
    res.writeHead(301, { Location: `https://${host}:${HTTPS_PORT}${req.url}` });
    res.end();
  }).listen(HTTP_PORT, () => {
    console.log(`➡️ Reindirizzamento HTTP attivo su http://localhost:${HTTP_PORT}`);
  });
} else {
  console.warn('⚠️  Certificati SSL non trovati. Avvio del solo server HTTP.');
  http.createServer(app).listen(HTTP_PORT, () => {
    console.log(`🚀 Server HTTP avviato su http://localhost:${HTTP_PORT}`);
  });
}
