const express = require('express');
const router = express.Router();
const disponibilitaController = require('../controllers/disponibilitaController');
const { verificaToken } = require('../middleware/authMiddleware');

// Ricerca disponibilità (solo utenti autenticati)
router.post('/disponibilita', verificaToken, disponibilitaController.ricercaDisponibilita);

// Visualizza disponibilità per spazio (pubblico)
router.get('/disponibilita/:spazio_id', disponibilitaController.visualizzaDisponibilitaSpazio);

module.exports = router;