const express = require('express');
const router = express.Router();
const prenotazioniController = require('../controllers/prenotazioniController');
const { verificaToken } = require('../middleware/authMiddleware');

// ✅ Creazione prenotazione (solo utenti autenticati)
router.post('/prenotazioni', verificaToken, prenotazioniController.creaPrenotazione);

// ✅ Visualizza prenotazioni dell'utente autenticato
router.get('/prenotazioni', verificaToken, prenotazioniController.visualizzaPrenotazioni);

// ✅ Prenotazioni dell'utente non ancora pagate
router.get('/prenotazioni/non-pagate', verificaToken, prenotazioniController.prenotazioniNonPagate);

// ✅ Modifica una prenotazione esistente
router.put('/prenotazioni/:id', verificaToken, prenotazioniController.modificaPrenotazione);

module.exports = router;
