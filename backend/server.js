const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rotte
app.use('/api', require('./routes/authRoutes'));           // Login, registrazione, logout
app.use('/api', require('./routes/userRoutes'));           // Profilo utente
app.use('/api/sedi', require('./routes/sediRoutes'));
app.use('/api/spazi', require('./routes/spaziRoutes'));
app.use('/api', require('./routes/prenotazioniRoutes'));   // Prenotazioni
app.use('/api', require('./routes/pagamentiRoutes'));      // Pagamenti simulati
app.use('/api', require('./routes/gestoreRoutes'));        // Dashboard gestore
app.use('/api/admin', require('./routes/adminRoutes'));    // Area admin
app.use('/api', require('./routes/disponibilitaRoutes'));
app.use('/api/riepilogo', require('./routes/riepilogoRoutes'));


// Avvio server
app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
});
