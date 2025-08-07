const pool = require('../db');

// Recupera spazi per una sede
exports.getSpaziPerSede = async (req, res) => {
  const { sede_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, sede_id, nome, descrizione, prezzo_orario, capienza, tipo_spazio, servizi, image_url
       FROM spazi WHERE sede_id = $1`,
      [sede_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Errore nel recupero spazi:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// Aggiunta nuovo spazio (gestore)
exports.aggiungiSpazio = async (req, res) => {
  const {
    sede_id,
    nome,
    descrizione,
    prezzo_orario,
    capienza,
    tipo_spazio,
    servizi,
    image_url,
  } = req.body;

  const tipiValidi = ['scrivania', 'ufficio', 'sala'];

  if (
    !sede_id ||
    !nome ||
    prezzo_orario === undefined ||
    capienza === undefined ||
    !tipo_spazio ||
    !servizi
  ) {
    return res.status(400).json({ message: 'Tutti i campi sono obbligatori.' });
  }

  if (isNaN(prezzo_orario) || prezzo_orario < 0) {
    return res.status(400).json({ message: 'Prezzo orario non valido.' });
  }

  if (isNaN(capienza) || capienza <= 0) {
    return res.status(400).json({ message: 'Capienza non valida.' });
  }

  if (!tipiValidi.includes(tipo_spazio)) {
    return res.status(400).json({ message: 'Tipo di spazio non valido' });
  }

  try {
    const sede = await pool.query('SELECT gestore_id FROM sedi WHERE id = $1', [sede_id]);

    if (sede.rows.length === 0) {
      return res.status(404).json({ message: 'Sede non trovata' });
    }

    if (sede.rows[0].gestore_id !== req.utente.id) {
      return res.status(403).json({ message: 'Accesso negato' });
    }

    const imageUrlSafe = image_url || null;
    const result = await pool.query(
      `INSERT INTO spazi (sede_id, nome, descrizione, prezzo_orario, capienza, tipo_spazio, servizi, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [sede_id, nome, descrizione, prezzo_orario, capienza, tipo_spazio, servizi, imageUrlSafe]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Errore inserimento spazio:', err);
    res.status(500).json({ message: 'Errore server durante inserimento spazio' });
  }
};

