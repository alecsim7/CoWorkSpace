const express = require('express');
const router = express.Router();
const pagamentiController = require('../controllers/pagamentiController');
const { verificaToken } = require('../middleware/authMiddleware'); // 👈 IMPORT CORRETTA

router.post('/pagamento', verificaToken, pagamentiController.effettuaPagamento); // 👈 OK

module.exports = router;
