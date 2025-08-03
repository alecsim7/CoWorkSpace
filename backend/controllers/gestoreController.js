const pool = require('../db');

// 1. Visualizza sedi gestite da un gestore
exports.getSediGestite = async (req, res) => {
  const { gestore_id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM sedi WHERE gestore_id = $1',
      [gestore_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Errore visualizzazione sedi:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// 2. Aggiungi spazio in una sede
exports.aggiungiSpazio = async (req, res) => {
  const { sede_id, nome, descrizione, prezzo_orario, capienza } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO spazi (sede_id, nome, descrizione, prezzo_ora, capienza) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [sede_id, nome, descrizione, prezzo_orario, capienza]
    );
    res.status(201).json({ spazio: result.rows[0] });
  } catch (err) {
    console.error('Errore aggiunta spazio:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// 3. Modifica spazio
exports.modificaSpazio = async (req, res) => {
  const { id } = req.params;
  const { nome, descrizione } = req.body;

  try {
    const result = await pool.query(
      'UPDATE spazi SET nome = $1, descrizione = $2 WHERE id = $3 RETURNING *',
      [nome, descrizione, id]
    );
    res.json({ spazio: result.rows[0] });
  } catch (err) {
    console.error('Errore modifica spazio:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// 4. Elimina spazio
exports.eliminaSpazio = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM spazi WHERE id = $1', [id]);
    res.json({ message: 'Spazio eliminato' });
  } catch (err) {
    console.error('Errore eliminazione spazio:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// 5. Aggiungi disponibilità a uno spazio
exports.aggiungiDisponibilita = async (req, res) => {
  const { id } = req.params;
  const { data, orario_inizio, orario_fine } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO disponibilita (spazio_id, data, orario_inizio, orario_fine) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, data, orario_inizio, orario_fine]
    );
    res.status(201).json({ disponibilita: result.rows[0] });
  } catch (err) {
    console.error('Errore aggiunta disponibilità:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// 6. Visualizza prenotazioni ricevute per il gestore
exports.visualizzaPrenotazioniRicevute = async (req, res) => {
  const { gestore_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.*, u.nome AS nome_utente, s.nome AS nome_spazio
       FROM prenotazioni p
       JOIN utenti u ON p.utente_id = u.id
       JOIN spazi s ON p.spazio_id = s.id
       JOIN sedi sede ON s.sede_id = sede.id
       WHERE sede.gestore_id = $1
       ORDER BY p.data, p.orario_inizio`,
      [gestore_id]
    );

    res.json({ prenotazioniRicevute: result.rows });
  } catch (err) {
    console.error('Errore prenotazioni ricevute:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// 7. Riepilogo prenotazioni per gestore (NUOVA funzione)
exports.getRiepilogoPrenotazioni = async (req, res) => {
  const { gestore_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS totale_prenotazioni,
              MIN(p.data) AS prima_prenotazione,
              MAX(p.data) AS ultima_prenotazione
       FROM prenotazioni p
       JOIN spazi s ON p.spazio_id = s.id
       JOIN sedi sede ON s.sede_id = sede.id
       WHERE sede.gestore_id = $1`,
      [gestore_id]
    );

    res.json({ riepilogo: result.rows[0] });
  } catch (err) {
    console.error('Errore nel riepilogo prenotazioni:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};
