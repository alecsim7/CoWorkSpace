const express = require('express');
const router = express.Router();
const spaziController = require('../controllers/spaziController');
const { verificaToken } = require('../middleware/authMiddleware');

// Recupera spazi per sede (accessibile a tutti)
router.get('/spazi/:sede_id', spaziController.getSpaziPerSede);

// Aggiungi spazio (protetto, per gestore)
router.post('/', verificaToken, spaziController.aggiungiSpazio);

module.exports = router;
