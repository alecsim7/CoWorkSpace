const pool = require('../db');

// Recupera sedi con filtro opzionale per città
exports.getSedi = async (req, res) => {
  try {
    const { citta } = req.query;

    let query = 'SELECT * FROM sedi';
    let params = [];

    if (citta) {
      query += ' WHERE citta = $1';
      params.push(citta);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Errore nel recupero sedi:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// Recupera sedi di un gestore
exports.getSediGestore = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, nome, citta FROM sedi WHERE gestore_id = $1',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Errore lettura sedi:', err);
    res.status(500).json({ message: 'Errore server durante lettura sedi' });
  }
};

// Aggiunta nuova sede
exports.aggiungiSede = async (req, res) => {
  const { nome, citta, indirizzo, gestore_id } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO sedi (nome, citta, indirizzo, gestore_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, citta, indirizzo, gestore_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Errore inserimento sede:', err);
    res.status(500).json({ message: 'Errore server durante inserimento sede' });
  }
};