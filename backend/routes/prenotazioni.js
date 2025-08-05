const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/non-pagate', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    const sessionResult = await db.query(
      'SELECT utente_id FROM sessioni WHERE token = $1',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ message: 'Sessione non valida' });
    }

    const utente_id = sessionResult.rows[0].utente_id;

    const result = await db.query(`
      SELECT 
        p.id,
        p.data,
        p.orario_inizio,
        p.orario_fine,
        s.nome as nome_spazio,
        s.prezzo_orario
      FROM prenotazioni p
      JOIN spazi s ON p.spazio_id = s.id
      WHERE p.utente_id = $1 
      AND p.id NOT IN (SELECT prenotazione_id FROM pagamenti)
      ORDER BY p.data ASC, p.orario_inizio ASC
    `, [utente_id]);

    res.json({ prenotazioni: result.rows });
  } catch (err) {
    console.error('Errore query prenotazioni:', err);
    res.status(500).json({ message: 'Errore nel recupero delle prenotazioni' });
  }
});

module.exports = router;
