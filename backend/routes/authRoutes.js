const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validateInput');

router.post('/register', validate.validateRegister, authController.register);
router.post('/login', validate.validateLogin, authController.login);
router.get('/logout', authController.logout);

module.exports = router;
