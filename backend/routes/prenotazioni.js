const express = require('express');
const router = express.Router();
const prenotazioniController = require('../controllers/prenotazioniController');

// Route per ottenere tutte le prenotazioni dell'utente
router.get('/', prenotazioniController.getPrenotazioni);

// Route per creare una nuova prenotazione
router.post('/', prenotazioniController.creaPrenotazione);

// Route per aggiornare una prenotazione esistente
router.put('/:id', prenotazioniController.aggiornaPrenotazione);

// Route per eliminare una prenotazione
router.delete('/:id', prenotazioniController.eliminaPrenotazione);

module.exports = router;