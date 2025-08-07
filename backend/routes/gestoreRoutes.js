const express = require('express');
const router = express.Router();
const gestoreController = require('../controllers/gestoreController');
const { verificaToken, verificaGestore } = require('../middleware/authMiddleware');


router.put('/spazi/:id', verificaToken, verificaGestore, gestoreController.modificaSpazio);
router.delete('/spazi/:id', verificaToken, verificaGestore, gestoreController.eliminaSpazio);
router.post('/spazi/:id/disponibilita', verificaToken, verificaGestore, gestoreController.aggiungiDisponibilita);
router.get('/gestore/prenotazioni/:gestore_id', verificaToken, verificaGestore, gestoreController.visualizzaPrenotazioniRicevute);
module.exports = router;
