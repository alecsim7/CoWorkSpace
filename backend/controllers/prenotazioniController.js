const pool = require('../db');

// ✅ Crea una prenotazione con controllo sovrapposizioni
exports.creaPrenotazione = async (req, res) => {
  const { utente_id, spazio_id, data, orario_inizio, orario_fine } = req.body;

  try {
    // 1. Controlla conflitti orari
    const conflict = await pool.query(
      `SELECT * FROM prenotazioni
       WHERE spazio_id = $1 AND data = $2
       AND NOT (orario_fine <= $3 OR orario_inizio >= $4)`,
      [spazio_id, data, orario_inizio, orario_fine]
    );

    if (conflict.rows.length > 0) {
      return res.status(400).json({ message: 'Orario già prenotato' });
    }

    // 2. Inserisci prenotazione
    const result = await pool.query(
      `INSERT INTO prenotazioni (utente_id, spazio_id, data, orario_inizio, orario_fine)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [utente_id, spazio_id, data, orario_inizio, orario_fine]
    );

    res.status(201).json({ message: 'Prenotazione creata', prenotazione: result.rows[0] });

  } catch (err) {
    console.error('Errore prenotazione:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// ✅ Visualizza prenotazioni utente con info su spazi e sedi
exports.visualizzaPrenotazioni = async (req, res) => {
  const utente_id = req.utente.id;

  try {
    const result = await pool.query(
      `SELECT p.*, s.nome AS nome_spazio, sede.nome AS nome_sede
       FROM prenotazioni p
       JOIN spazi s ON p.spazio_id = s.id
       JOIN sedi sede ON s.sede_id = sede.id
       WHERE p.utente_id = $1
       ORDER BY data, orario_inizio`,
      [utente_id]
    );

    res.json({ prenotazioni: result.rows });
  } catch (err) {
    console.error('Errore recupero prenotazioni:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};
