const express = require('express');
const router = express.Router();
const authController = require('../controllers/validateInput');
const authMW = require('../middleware/authMiddleware');
const validate = require('../middleware/validateInput');
const validateRegister = (authMW && authMW.validateRegister) ? authMW.validateRegister : (req, res, next) => next();
const validateLogin = (authMW && authMW.validateLogin) ? authMW.validateLogin : (req, res, next) => next();

// Route per la registrazione utente, con validazione input
router.post('/register', validateRegister, authController.register);

// Route per il login utente, con validazione input
router.post('/login', validateLogin, authController.login);

// Route per il logout utente
router.get('/logout', authController.logout);

module.exports = router;
