const express = require('express');
const router = express.Router();
const prenotazioniController = require('../controllers/prenotazioniController');

router.get('/', prenotazioniController.getPrenotazioni);
router.post('/', prenotazioniController.creaPrenotazione);
router.put('/:id', prenotazioniController.aggiornaPrenotazione);
router.delete('/:id', prenotazioniController.eliminaPrenotazione);

module.exports = router;