const express = require('express');
const router = express.Router();
const pagamentiController = require('../controllers/pagamentiController');
const { verificaToken } = require('../middleware/authMiddleware'); // 👈 IMPORT CORRETTA

router.post('/pagamento', verificaToken, pagamentiController.effettuaPagamento); // 👈 OK
router.get('/storico', verificaToken, pagamentiController.storicoPagamenti);

// Assicurati che la funzione esista e sia esportata correttamente
router.post('/crea', pagamentiController.creaPagamento); // nomeFunzione deve essere una funzione

module.exports = router;
