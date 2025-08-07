const pool = require('../db');

// ✅ Crea una prenotazione e calcola l'importo da pagare
exports.creaPrenotazione = async (req, res) => {
  const { spazio_id, data, orario_inizio, orario_fine } = req.body;

  try {
    await pool.query('BEGIN');

    // 1. Verifica capienza e prenotazioni esistenti
    const spazioRes = await pool.query(
      `SELECT s.prezzo_orario, s.capienza, COUNT(p.id) AS prenotati
       FROM spazi s
       LEFT JOIN prenotazioni p ON p.spazio_id = s.id
         AND p.data = $2
         AND NOT (p.orario_fine <= $3 OR p.orario_inizio >= $4)
       WHERE s.id = $1
       GROUP BY s.prezzo_orario, s.capienza`,
      [spazio_id, data, orario_inizio, orario_fine]
    );

    if (spazioRes.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Spazio non trovato' });
    }

    const { prezzo_orario, capienza, prenotati } = spazioRes.rows[0];
    const prenotatiCount = Number(prenotati);
    const posti_liberi = capienza - prenotatiCount;

    if (posti_liberi <= 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ message: 'Capienza massima raggiunta', posti_liberi: 0 });
    }

    const start = new Date(`1970-01-01T${orario_inizio}`);
    const end = new Date(`1970-01-01T${orario_fine}`);
    const ore = (end - start) / (1000 * 60 * 60);
    const importo = Number(prezzo_orario) * ore;

    // 2. Inserisci prenotazione
    const result = await pool.query(
      `INSERT INTO prenotazioni (utente_id, spazio_id, data, orario_inizio, orario_fine)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.utente.id, spazio_id, data, orario_inizio, orario_fine]
    );

    await pool.query('COMMIT');

    res.status(201).json({
      message: 'Prenotazione effettuata',
      prenotazione: result.rows[0],
      importo,
      posti_liberi: posti_liberi - 1
    });

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Errore prenotazione:', err);
    res.status(500).json({ message: 'Errore del server', error: err.message });
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
      `SELECT p.*, s.nome AS nome_spazio, sede.nome AS nome_sede, s.prezzo_orario, pag.id AS pagamento_id, pag.importo AS importo
       FROM prenotazioni p
       JOIN spazi s ON p.spazio_id = s.id
       JOIN sedi sede ON s.sede_id = sede.id
       LEFT JOIN pagamenti pag ON pag.prenotazione_id = p.id
       WHERE p.utente_id = $1 AND (pag.id IS NULL OR pag.id = 0)
       ORDER BY data, orario_inizio`,
      [utente_id]
    );

    res.json({ prenotazioni: result.rows });
  } catch (err) {
    console.error('Errore recupero prenotazioni non pagate:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// ✅ Elimina una prenotazione dell'utente
exports.eliminaPrenotazione = async (req, res) => {
  console.log('Richiesta eliminazione prenotazione ricevuta:', req.params.id, req.utente?.id); // Debug

  const { id } = req.params;
  const utenteId = req.utente.id;

  try {
    // Verifica che la prenotazione appartenga all'utente
    const result = await pool.query(
      'SELECT id FROM prenotazioni WHERE id = $1 AND utente_id = $2',
      [id, utenteId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Prenotazione non trovata o accesso negato' });
    }

    // Log per debug
    console.log(`Elimino pagamenti per prenotazione ${id}`);
    const deletePagamenti = await pool.query('DELETE FROM pagamenti WHERE prenotazione_id = $1 RETURNING *', [id]);
    console.log('Pagamenti eliminati:', deletePagamenti.rowCount);

    // Log per debug
    console.log(`Elimino prenotazione ${id}`);
    const deletePrenotazione = await pool.query('DELETE FROM prenotazioni WHERE id = $1 RETURNING *', [id]);
    console.log('Prenotazione eliminata:', deletePrenotazione.rowCount);

    res.json({ message: 'Prenotazione eliminata' });
  } catch (err) {
    console.error('Errore eliminazione prenotazione:', err);
    res.status(500).json({ message: 'Errore del server', error: err.message, stack: err.stack });
  }
};
