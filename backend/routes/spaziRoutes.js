const express = require('express');
const router = express.Router();
const spaziController = require('../controllers/spaziController');

// Recupera spazi per sede (accessibile a tutti)
router.get('/:sede_id', spaziController.getSpaziPerSede);

module.exports = router;
