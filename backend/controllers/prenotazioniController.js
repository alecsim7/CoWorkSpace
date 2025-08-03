const pool = require('../db');

// ✅ Crea una prenotazione con pagamento immediato
exports.creaPrenotazione = async (req, res) => {
  const { utente_id, spazio_id, data, orario_inizio, orario_fine } = req.body;

  try {
    await pool.query('BEGIN');

    // 1. Controlla conflitti orari
    const conflict = await pool.query(
      `SELECT * FROM prenotazioni
       WHERE spazio_id = $1 AND data = $2
       AND NOT (orario_fine <= $3 OR orario_inizio >= $4)`,
      [spazio_id, data, orario_inizio, orario_fine]
    );

    if (conflict.rows.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ message: 'Orario già prenotato' });
    }

    // 2. Calcola importo da pagare
    const prezzoRes = await pool.query(
      'SELECT prezzo_orario FROM spazi WHERE id = $1',
      [spazio_id]
    );

    if (prezzoRes.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Spazio non trovato' });
    }

    const start = new Date(`1970-01-01T${orario_inizio}`);
    const end = new Date(`1970-01-01T${orario_fine}`);
    const ore = (end - start) / (1000 * 60 * 60);
    const importo = Number(prezzoRes.rows[0].prezzo_orario) * ore;

    // 3. Inserisci prenotazione
    const result = await pool.query(
      `INSERT INTO prenotazioni (utente_id, spazio_id, data, orario_inizio, orario_fine)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [utente_id, spazio_id, data, orario_inizio, orario_fine]
    );

    // 4. Registra pagamento
    await pool.query(
      `INSERT INTO pagamenti (prenotazione_id, importo, timestamp)
       VALUES ($1, $2, NOW())`,
      [result.rows[0].id, importo]
    );

    await pool.query('COMMIT');

    res.status(201).json({
      message: 'Prenotazione e pagamento effettuati',
      prenotazione: result.rows[0],
      pagamento: { importo }
    });

  } catch (err) {
    await pool.query('ROLLBACK');
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

// ✅ Modifica una prenotazione esistente dell'utente
exports.modificaPrenotazione = async (req, res) => {
  const { id } = req.params;
  const { data, orario_inizio, orario_fine } = req.body;
  const utente_id = req.utente.id;

  try {
    // Verifica che la prenotazione esista e appartenga all'utente
    const prenotazioneRes = await pool.query(
      'SELECT * FROM prenotazioni WHERE id = $1 AND utente_id = $2',
      [id, utente_id]
    );

    if (prenotazioneRes.rows.length === 0) {
      return res.status(404).json({ message: 'Prenotazione non trovata' });
    }

    const spazio_id = prenotazioneRes.rows[0].spazio_id;

    // Controlla conflitti con altre prenotazioni
    const conflict = await pool.query(
      `SELECT * FROM prenotazioni
       WHERE spazio_id = $1 AND data = $2 AND id <> $5
       AND NOT (orario_fine <= $3 OR orario_inizio >= $4)`,
      [spazio_id, data, orario_inizio, orario_fine, id]
    );

    if (conflict.rows.length > 0) {
      return res.status(400).json({ message: 'Orario già prenotato' });
    }

    const result = await pool.query(
      `UPDATE prenotazioni SET data = $1, orario_inizio = $2, orario_fine = $3
       WHERE id = $4 RETURNING *`,
      [data, orario_inizio, orario_fine, id]
    );

    res.json({ message: 'Prenotazione aggiornata', prenotazione: result.rows[0] });

  } catch (err) {
    console.error('Errore aggiornamento prenotazione:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};
