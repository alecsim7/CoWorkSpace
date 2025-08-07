const express = require('express');
const router = express.Router();
const gestoreController = require('../controllers/gestoreController');
const { verificaToken, verificaGestore } = require('../middleware/authMiddleware');


router.get('/dashboard/sedi/:gestore_id', verificaToken, verificaGestore, gestoreController.getSediGestite);
router.put('/spazi/:id', verificaToken, verificaGestore, gestoreController.modificaSpazio);
router.delete('/spazi/:id', verificaToken, verificaGestore, gestoreController.eliminaSpazio);
router.post('/spazi/:id/disponibilita', verificaToken, verificaGestore, gestoreController.aggiungiDisponibilita);
router.get('/prenotazioni/:gestore_id', verificaToken, verificaGestore, gestoreController.visualizzaPrenotazioniRicevute);
router.get('/riepilogo/:gestore_id', verificaToken, verificaGestore, gestoreController.getRiepilogoPrenotazioni);

module.exports = router;
