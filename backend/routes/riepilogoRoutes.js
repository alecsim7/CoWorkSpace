const express = require('express');
const router = express.Router();
const riepilogoController = require('../controllers/riepilogoController');
const { verificaToken, verificaGestore } = require('../middleware/authMiddleware');

router.get('/:id', verificaToken, verificaGestore, riepilogoController.getRiepilogoPrenotazioni);

module.exports = router;
