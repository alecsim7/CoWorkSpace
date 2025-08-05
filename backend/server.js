const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Aggiunto import del database
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Debug route to test if endpoint is accessible
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Add pagamenti/storico endpoint
app.get('/api/pagamenti/storico', async (req, res) => {
  console.log('Ricevuta richiesta storico pagamenti'); // Debug log
  
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('Token mancante'); // Debug log
      return res.status(401).json({ message: 'Token mancante' });
    }

    const sessionQuery = await db.query(
      'SELECT utente_id FROM sessioni WHERE token = $1',
      [token]
    );

    if (sessionQuery.rows.length === 0) {
      console.log('Sessione non trovata'); // Debug log
      return res.status(401).json({ message: 'Sessione non valida' });
    }

    const utente_id = sessionQuery.rows[0].utente_id;
    console.log('Utente ID:', utente_id); // Debug log

    const result = await db.query(`
      SELECT 
        p.created_at as data_pagamento,
        p.metodo_pagamento,
        p.importo,
        pr.data as data_prenotazione,
        pr.orario_inizio,
        pr.orario_fine,
        s.nome as nome_spazio
      FROM pagamenti p
      JOIN prenotazioni pr ON p.prenotazione_id = pr.id
      JOIN spazi s ON pr.spazio_id = s.id
      WHERE pr.utente_id = $1
      ORDER BY p.created_at DESC
    `, [utente_id]);

    console.log('Pagamenti trovati:', result.rows.length); // Debug log
    res.json({ pagamenti: result.rows });
  } catch (err) {
    console.error('Errore query:', err); // Debug log
    res.status(500).json({ message: 'Errore nel recupero dello storico pagamenti' });
  }
});

// Rotte
app.get('/', (_, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));
app.use('/api', require('./routes/authRoutes'));           // Login, registrazione, logout
app.use('/api', require('./routes/userRoutes'));           // Profilo utente
app.use('/api/sedi', require('./routes/sediRoutes'));
app.use('/api/spazi', require('./routes/spaziRoutes'));
const prenotazioniRoutes = require('./routes/prenotazioni');
const pagamentiRoutes = require('./routes/pagamenti');

app.use('/api/prenotazioni', prenotazioniRoutes);
app.use('/api/pagamenti', pagamentiRoutes);
app.use('/api', require('./routes/gestoreRoutes'));        // Dashboard gestore
app.use('/api/admin', require('./routes/adminRoutes'));    // Area admin
app.use('/api', require('./routes/disponibilitaRoutes'));
app.use('/api/riepilogo', require('./routes/riepilogoRoutes'));


// Avvio server
app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
});
