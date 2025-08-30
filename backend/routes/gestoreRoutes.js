const express = require('express');
const router = express.Router();
const gestoreController = require('../controllers/gestoreController');
const { verificaToken, verificaGestore } = require('../middleware/authMiddleware');


// Route per aggiungere un nuovo spazio (solo gestore autenticato)
router.post('/spazi', verificaToken, verificaGestore, gestoreController.aggiungiSpazio);

// Route per modificare uno spazio esistente (solo gestore autenticato)
router.put('/spazi/:id', verificaToken, verificaGestore, gestoreController.modificaSpazio);

// Route per eliminare uno spazio (solo gestore autenticato)
router.delete('/spazi/:id', verificaToken, verificaGestore, gestoreController.eliminaSpazio);

// Route per aggiungere disponibilità a uno spazio (solo gestore autenticato)
router.post('/spazi/:id/disponibilita', verificaToken, verificaGestore, gestoreController.aggiungiDisponibilita);

// Route per visualizzare le prenotazioni ricevute dal gestore (solo gestore autenticato)
router.get('/gestore/prenotazioni/:gestore_id', verificaToken, verificaGestore, gestoreController.visualizzaPrenotazioniRicevute);


module.exports = router;
