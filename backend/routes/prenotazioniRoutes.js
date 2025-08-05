const express = require('express');
const router = express.Router();
const prenotazioniController = require('../controllers/prenotazioniController');
const { verificaToken } = require('../middleware/authMiddleware');

// ✅ Creazione prenotazione (solo utenti autenticati)
router.post('/', verificaToken, prenotazioniController.creaPrenotazione);

// ✅ Visualizza prenotazioni dell'utente autenticato
router.get('/', verificaToken, prenotazioniController.visualizzaPrenotazioni);

// ✅ Prenotazioni dell'utente non ancora pagate
router.get('/non-pagate', verificaToken, prenotazioniController.prenotazioniNonPagate);

// ✅ Modifica una prenotazione esistente
router.put('/:id', verificaToken, prenotazioniController.modificaPrenotazione);

// ✅ Elimina una prenotazione esistente
router.delete('/:id', verificaToken, prenotazioniController.eliminaPrenotazione);

module.exports = router;
