const express = require('express');
const router = express.Router();
const riepilogoController = require('../controllers/riepilogoController');
const { verificaToken, verificaGestore } = require('../middleware/authMiddleware');

// Route per ottenere il riepilogo delle prenotazioni di un gestore (autenticazione e autorizzazione gestore richieste)
router.get('/:id', verificaToken, verificaGestore, riepilogoController.getRiepilogoPrenotazioni);

module.exports = router;
