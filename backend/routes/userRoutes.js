const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validateInput');

router.get('/profilo/:id', userController.getProfilo);
router.put(
  '/utente/me',
  authMiddleware.verificaToken,
  validate.validateUpdateProfilo,
  userController.updateProfilo
);

module.exports = router;
