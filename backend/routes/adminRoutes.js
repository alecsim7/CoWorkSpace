const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

const { verificaToken, verificaAdmin } = require('../middleware/authMiddleware');

router.use(verificaToken, verificaAdmin);

// Visualizza tutti gli utenti
router.get('/utenti', adminController.getUtenti);

// Visualizza tutte le sedi
router.get('/sedi', adminController.getSedi);

// Elimina un utente
router.delete('/utenti/:id', adminController.eliminaUtente);

// Elimina una sede
router.delete('/sedi/:id', adminController.eliminaSede);

module.exports = router;
