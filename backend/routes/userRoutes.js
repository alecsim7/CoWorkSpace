const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validateInput');

// DEPRECATO: la rotta /profilo/:id è stata sostituita da /api/utente/me
router.get('/profilo/:id', userController.getProfilo);

router.put(
  '/utente/me',
  authMiddleware.verificaToken,
  validate.validateUpdateProfilo,
  userController.updateProfilo
);

module.exports = router;
