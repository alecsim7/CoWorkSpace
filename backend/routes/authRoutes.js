const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validateInput');

// Route per la registrazione utente, con validazione input
router.post('/register', validate.validateRegister, authController.register);

// Route per il login utente, con validazione input
router.post('/login', validate.validateLogin, authController.login);

// Route per il logout utente
router.get('/logout', authController.logout);

module.exports = router;
