// Importa Express e crea un router
const express = require('express');
const router = express.Router();

// Importa il controller dei pagamenti
const pagamentiController = require('../controllers/pagamentiController');

// Importa il middleware per la verifica del token di autenticazione
const { verificaToken } = require('../middleware/authMiddleware'); 

// Rotta per effettuare un pagamento (protetta da verificaToken)
router.post('/pagamento', verificaToken, pagamentiController.effettuaPagamento);

// Rotta per ottenere lo storico dei pagamenti (protetta da verificaToken)
router.get('/storico', verificaToken, pagamentiController.storicoPagamenti);

// Esporta il router per essere utilizzato nell'app principale
module.exports = router;
