const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/profilo/:id', userController.getProfilo);

module.exports = router;
