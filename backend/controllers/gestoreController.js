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

// 2. Modifica spazio
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

// 3. Elimina spazio
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

// 4. Aggiungi disponibilità a uno spazio
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

// 5. Visualizza prenotazioni ricevute per il gestore
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

// 6. Riepilogo prenotazioni per gestore (NUOVA funzione)
exports.getRiepilogoPrenotazioni = async (req, res) => {
  const { gestore_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         sede.nome AS nome_sede,
         s.nome AS nome_spazio,
         s.image_url,
         COUNT(p.id) AS totale_prenotazioni
       FROM spazi s
       JOIN sedi sede ON s.sede_id = sede.id
       LEFT JOIN prenotazioni p ON p.spazio_id = s.id
       WHERE sede.gestore_id = $1
       GROUP BY s.id, sede.nome, s.nome, s.image_url
       ORDER BY sede.nome, s.nome`,
      [gestore_id]
    );

    res.json({ riepilogo: result.rows });
  } catch (err) {
    console.error('Errore nel riepilogo prenotazioni:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};
