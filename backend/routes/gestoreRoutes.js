const express = require('express');
const router = express.Router();
const gestoreController = require('../controllers/gestoreController');
const { verificaToken } = require('../middleware/authMiddleware');  


router.get('/dashboard/sedi/:gestore_id', verificaToken, gestoreController.getSediGestite);
router.post('/spazi', verificaToken, gestoreController.aggiungiSpazio);
router.put('/spazi/:id', verificaToken, gestoreController.modificaSpazio);
router.delete('/spazi/:id', verificaToken, gestoreController.eliminaSpazio);
router.post('/spazi/:id/disponibilita', verificaToken, gestoreController.aggiungiDisponibilita);
router.get('/prenotazioni/:gestore_id', verificaToken, gestoreController.visualizzaPrenotazioniRicevute);
router.get('/riepilogo/:gestore_id', verificaToken, gestoreController.getRiepilogoPrenotazioni);

module.exports = router;
