const express = require('express');
const router = express.Router();
const spaziController = require('../controllers/spaziController');

// Route GET per ottenere tutti gli spazi
router.get('/', spaziController.getAllSpazi);

// Recupera spazi per sede (accessibile a tutti)
router.get('/:sede_id', spaziController.getSpaziPerSede);

module.exports = router;
