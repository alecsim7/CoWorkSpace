const express = require('express');
const router = express.Router();
const sediController = require('../controllers/sediController');
const { verificaToken } = require('../middleware/authMiddleware');

// Aggiungi sede (protetto)
router.post('/', verificaToken, sediController.aggiungiSede);

// Recupera sedi per gestore (protetto)
router.get('/gestore/:id', verificaToken, sediController.getSediGestore);

// Recupera liste di opzioni pubbliche
router.get('/opzioni', sediController.getOpzioni);

// Dettaglio di una singola sede
router.get('/:id', sediController.getSedeById);

// Recupera sedi filtrabili (per client/guest)
router.get('/', sediController.getSedi);

module.exports = router;
