const express = require('express');
const router = express.Router();
const riepilogoController = require('../controllers/riepilogoController');
const { verificaToken } = require('../middleware/authMiddleware');

router.get('/:id', verificaToken, riepilogoController.getRiepilogoPrenotazioni);

module.exports = router;
