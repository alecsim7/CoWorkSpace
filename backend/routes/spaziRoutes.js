const express = require('express');
const router = express.Router();
const spaziController = require('../controllers/spaziController');
const { verificaToken, verificaGestore } = require('../middleware/authMiddleware');

// Recupera spazi per sede (accessibile a tutti)
router.get('/:sede_id', spaziController.getSpaziPerSede);

// Aggiungi spazio (solo per gestore)
router.post('/', verificaToken, verificaGestore, spaziController.aggiungiSpazio);

module.exports = router;
