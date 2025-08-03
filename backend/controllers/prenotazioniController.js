const pool = require('../db');

// ✅ Crea una prenotazione e calcola l'importo da pagare
exports.creaPrenotazione = async (req, res) => {
  const { spazio_id, data, orario_inizio, orario_fine } = req.body;

  // L'ID dell'utente autenticato viene letto dal token e non dal body

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
      `INSERT INTO prenotazioni (utente_id, spazio_id, data, orario_inizio, orario_fine, importo)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.utente.id, spazio_id, data, orario_inizio, orario_fine, importo]
    );

    await pool.query('COMMIT');

    res.status(201).json({
      message: 'Prenotazione effettuata',
      prenotazione: result.rows[0]
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
      `SELECT p.*, s.nome AS nome_spazio, sede.nome AS nome_sede, pag.id AS pagamento_id
       FROM prenotazioni p
       JOIN spazi s ON p.spazio_id = s.id
       JOIN sedi sede ON s.sede_id = sede.id
       LEFT JOIN pagamenti pag ON pag.prenotazione_id = p.id
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

// ✅ Recupera prenotazioni dell'utente non ancora pagate
exports.prenotazioniNonPagate = async (req, res) => {
  const utente_id = req.utente.id;

  try {
    const result = await pool.query(
      `SELECT p.*, s.nome AS nome_spazio, s.prezzo_orario, sede.nome AS nome_sede, pag.id AS pagamento_id
       FROM prenotazioni p
       JOIN spazi s ON p.spazio_id = s.id
       JOIN sedi sede ON s.sede_id = sede.id
       LEFT JOIN pagamenti pag ON pag.prenotazione_id = p.id
       WHERE p.utente_id = $1 AND (pag.id IS NULL OR pag.id = 0)
       ORDER BY data, orario_inizio`,
      [utente_id]
    );

    const prenotazioni = result.rows.map(p => {
      let importo = parseFloat(p.importo);
      if (isNaN(importo)) {
        const start = new Date(`1970-01-01T${p.orario_inizio}`);
        const end = new Date(`1970-01-01T${p.orario_fine}`);
        const ore = (end - start) / (1000 * 60 * 60);
        importo = parseFloat(p.prezzo_orario) * ore;
      }
      const { prezzo_orario, ...rest } = p;
      return { ...rest, importo };
    });

    res.json({ prenotazioni });
  } catch (err) {
    console.error('Errore recupero prenotazioni non pagate:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};
