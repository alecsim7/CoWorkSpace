const express = require('express');
const router = express.Router();
const gestoreController = require('../controllers/gestoreController');
const pool = require('../db');

// Route GET per ottenere tutti gli spazi
router.get('/spazi', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM spazi');
    res.json({ spazi: result.rows });
  } catch (err) {
    console.error('Errore caricamento spazi:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Route POST per aggiungere uno spazio
router.post('/spazi', gestoreController.aggiungiSpazio);

// Route PUT per modificare uno spazio
router.put('/spazi/:id', gestoreController.modificaSpazio);

// Route DELETE per eliminare uno spazio
router.delete('/spazi/:id', gestoreController.eliminaSpazio);

// Route POST per aggiungere disponibilità a uno spazio
router.post('/spazi/:id/disponibilita', gestoreController.aggiungiDisponibilita);

// Route GET per visualizzare prenotazioni ricevute per il gestore
router.get('/prenotazioniRicevute/:gestore_id', gestoreController.visualizzaPrenotazioniRicevute);

module.exports = router;