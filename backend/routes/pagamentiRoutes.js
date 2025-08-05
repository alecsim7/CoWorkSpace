const express = require('express');
const router = express.Router();
const pagamentiController = require('../controllers/pagamentiController');
const { verificaToken } = require('../middleware/authMiddleware'); // 👈 IMPORT CORRETTA
const pool = require('../db');

router.post('/pagamento', verificaToken, pagamentiController.effettuaPagamento); // 👈 OK
router.get('/storico', verificaToken, pagamentiController.storicoPagamenti);

router.get('/storico', verificaToken, async (req, res) => {
  try {
    const utente_id = req.utente.id;
    const result = await pool.query(`
      SELECT p.*, pr.data as data_prenotazione, pr.orario_inizio, pr.orario_fine, s.nome as nome_spazio
      FROM pagamenti p
      JOIN prenotazioni pr ON p.prenotazione_id = pr.id
      JOIN spazi s ON pr.spazio_id = s.id
      WHERE pr.utente_id = $1
      ORDER BY p.created_at DESC
    `, [utente_id]);

    res.json({ pagamenti: result.rows });
  } catch (err) {
    console.error('Errore:', err);
    res.status(500).json({ message: 'Errore interno' });
  }
});

module.exports = router;
