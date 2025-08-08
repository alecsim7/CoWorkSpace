const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const app = express();
const HTTP_PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

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
app.use('/api', require('./routes/authRoutes'));           // Login, registrazione, logout
app.use('/api', require('./routes/userRoutes'));           // Profilo utente
app.use('/api/sedi', require('./routes/sediRoutes'));
app.use('/api/spazi', require('./routes/spaziRoutes'));
const prenotazioniRoutes = require('./routes/prenotazioniRoutes');
const pagamentiRoutes = require('./routes/pagamentiRoutes');

app.use('/api/prenotazioni', prenotazioniRoutes);
app.use('/api/pagamenti', pagamentiRoutes);
app.use('/api/riepilogo', require('./routes/riepilogoRoutes'));
app.use('/api', require('./routes/gestoreRoutes'));        // Dashboard gestore
app.use('/api/admin', require('./routes/adminRoutes'));    // Area admin
app.use('/api', require('./routes/disponibilitaRoutes'));


// Avvio server HTTPS
const httpsOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH || path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH || path.join(__dirname, 'cert', 'cert.pem')),
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
