const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validateInput');

// Route deprecata: visualizza profilo utente tramite ID (usare /utente/me)
router.get('/profilo/:id', userController.getProfilo);

// Route per ottenere il profilo dell'utente autenticato (tramite token)
router.get(
  '/utente/me',
  authMiddleware.verificaToken,
  userController.getProfiloAutenticato
);

// Route per aggiornare il profilo dell'utente autenticato (con validazione input)
router.put(
  '/utente/me',
  authMiddleware.verificaToken,
  validate.validateUpdateProfilo,
  userController.updateProfilo
);

module.exports = router;
