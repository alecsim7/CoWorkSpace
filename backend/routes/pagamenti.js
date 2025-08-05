const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/storico', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const sessionResult = await db.query(
      'SELECT utente_id FROM sessioni WHERE token = $1',
      [token]
    );

    if (!token || sessionResult.rows.length === 0) {
      return res.status(401).json({ message: 'Non autorizzato' });
    }

    const utente_id = sessionResult.rows[0].utente_id;
    const result = await db.query(`
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