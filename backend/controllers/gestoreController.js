const pool = require('../db');
const spaziController = require('./spaziController');

// 0. Aggiungi spazio (riusa la logica del controller degli spazi)
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

  // Log dei parametri ricevuti per debug
  console.log('Ricevuto:', req.body);

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

    const result = await pool.query(
      `INSERT INTO spazi (sede_id, nome, descrizione, prezzo_orario, capienza, tipo_spazio, servizi, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        sede_id,
        nome,
        descrizione,
        prezzo_orario,
        capienza,
        tipo_spazio,
        servizi,
        image_url || null,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Errore inserimento spazio:', err);
    // Risposta dettagliata per debug
    return res.status(500).json({ message: 'Errore server durante inserimento spazio', error: err.message, stack: err.stack });
  }
};


// 1. Modifica spazio
exports.modificaSpazio = async (req, res) => {
  const { id } = req.params;
  const { nome, descrizione } = req.body;

  try {
    const { rows } = await pool.query(
      `SELECT sedi.gestore_id
       FROM spazi JOIN sedi ON spazi.sede_id = sedi.id
       WHERE spazi.id = $1`,
      [id]
    );

    if (rows[0]?.gestore_id !== req.utente.id) {
      return res.status(403).json({ message: 'Accesso negato' });
    }

    const result = await pool.query(
      'UPDATE spazi SET nome = $1, descrizione = $2 WHERE id = $3 RETURNING *',
      [nome, descrizione, id]
    );
    res.json({ spazio: result.rows[0] });
  } catch (err) {
    console.error('Errore modifica spazio:', err);
    res.status(500).json({ message: 'Errore del server', error: err.message, stack: err.stack });
  }
};

// 2. Elimina spazio
exports.eliminaSpazio = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT sedi.gestore_id
       FROM spazi JOIN sedi ON spazi.sede_id = sedi.id
       WHERE spazi.id = $1`,
      [id]
    );

    if (rows[0]?.gestore_id !== req.utente.id) {
      return res.status(403).json({ message: 'Accesso negato' });
    }

    await pool.query('DELETE FROM spazi WHERE id = $1', [id]);
    res.json({ message: 'Spazio eliminato' });
  } catch (err) {
    console.error('Errore eliminazione spazio:', err);
    res.status(500).json({ message: 'Errore del server', error: err.message, stack: err.stack });
  }
};

// 3. Aggiungi disponibilità a uno spazio
exports.aggiungiDisponibilita = async (req, res) => {
  const { id } = req.params;
  const { data, orario_inizio, orario_fine } = req.body;

  try {
    const { rows } = await pool.query(
      `SELECT sedi.gestore_id
       FROM spazi JOIN sedi ON spazi.sede_id = sedi.id
       WHERE spazi.id = $1`,
      [id]
    );

    if (rows[0]?.gestore_id !== req.utente.id) {
      return res.status(403).json({ message: 'Accesso negato' });
    }

    const result = await pool.query(
      'INSERT INTO disponibilita (spazio_id, data, orario_inizio, orario_fine) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, data, orario_inizio, orario_fine]
    );
    res.status(201).json({ disponibilita: result.rows[0] });
  } catch (err) {
    console.error('Errore aggiunta disponibilità:', err);
    res.status(500).json({ message: 'Errore del server', error: err.message, stack: err.stack });
  }
};

// 4. Visualizza prenotazioni ricevute per il gestore
exports.visualizzaPrenotazioniRicevute = async (req, res) => {
  const { gestore_id } = req.params;

  if (req.utente.id !== parseInt(gestore_id)) {
    return res.status(403).json({ message: 'Accesso negato' });
  }

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
    res.status(500).json({ message: 'Errore del server', error: err.message, stack: err.stack });
  }
};

// 5. Ottieni tutti gli spazi
exports.getAllSpazi = async (req, res) => {
  console.log('Chiamata ricevuta per getAllSpazi'); // Debug
  try {
    // Stampa info sulla connessione
    console.log('Pool config:', pool.options || pool); // Debug
    const result = await pool.query(
      `SELECT id, sede_id, nome, descrizione, prezzo_orario, capienza, tipo_spazio, servizi, image_url FROM spazi`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Errore caricamento spazi:', err);
    res.status(500).json({ message: 'Errore del server', error: err.message, stack: err.stack });
  }
};
