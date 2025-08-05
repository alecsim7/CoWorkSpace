const pool = require('../db');

// Recupera sedi con filtri opzionali per città, tipo spazio e servizi
exports.getSedi = async (req, res) => {
  try {
    const { citta, tipo, servizio } = req.query;

    let query = 'SELECT DISTINCT s.* FROM sedi s';
    const where = [];
    const params = [];

    if (tipo || servizio) {
      query += ' JOIN spazi sp ON s.id = sp.sede_id';
    }

    if (citta) {
      params.push(citta);
      where.push(`s.citta = $${params.length}`);
    }

    if (tipo) {
      params.push(tipo);
      where.push(`sp.tipo_spazio = $${params.length}`);
    }

    if (servizio) {
      params.push(`%${servizio}%`);
      where.push(`sp.servizi ILIKE $${params.length}`);
    }

    if (where.length > 0) {
      query += ' WHERE ' + where.join(' AND ');
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Errore nel recupero sedi:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// Restituisce liste di valori per filtri pubblici
exports.getOpzioni = async (req, res) => {
  try {
    const cittaResult = await pool.query('SELECT DISTINCT citta FROM sedi');
    const tipoResult = await pool.query('SELECT DISTINCT tipo_spazio FROM spazi');
    const serviziResult = await pool.query('SELECT servizi FROM spazi WHERE servizi IS NOT NULL');

    const serviziSet = new Set();
    serviziResult.rows.forEach(row => {
      row.servizi
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .forEach(s => serviziSet.add(s));
    });

    res.json({
      citta: cittaResult.rows.map(r => r.citta),
      tipi: tipoResult.rows.map(r => r.tipo_spazio),
      servizi: Array.from(serviziSet),
    });
  } catch (err) {
    console.error('Errore nel recupero opzioni sedi:', err);
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

// Recupera dettagli di una singola sede con i relativi spazi
exports.getSedeById = async (req, res) => {
  const { id } = req.params;

  try {
    const sedeResult = await pool.query('SELECT * FROM sedi WHERE id = $1', [id]);

    if (sedeResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sede non trovata' });
    }

    const spaziResult = await pool.query('SELECT * FROM spazi WHERE sede_id = $1', [id]);

    const sede = sedeResult.rows[0];
    sede.spazi = spaziResult.rows;

    res.json(sede);
  } catch (err) {
    console.error('Errore recupero sede:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};
