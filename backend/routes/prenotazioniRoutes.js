const express = require('express');
const router = express.Router();
const prenotazioniController = require('../controllers/prenotazioniController');
const { verificaToken } = require('../middleware/authMiddleware');

// ✅ Creazione prenotazione (solo utenti autenticati)
router.post('/prenotazioni', verificaToken, prenotazioniController.creaPrenotazione);

// ✅ Visualizza prenotazioni di un utente (solo se autenticato)
router.get('/prenotazioni/:utente_id', verificaToken, prenotazioniController.visualizzaPrenotazioni);

module.exports = router;
