const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// DEPRECATO: la rotta /profilo/:id è stata sostituita da /api/utente/me
// router.get('/profilo/:id', userController.getProfilo);

module.exports = router;
