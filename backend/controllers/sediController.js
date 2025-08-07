const pool = require('../db');

// Recupera sedi con filtri opzionali per città, tipo spazio e servizi
exports.getSedi = async (req, res) => {
  try {
    const { citta, servizio, tipo } = req.query;

    let query = 'SELECT DISTINCT s.* FROM sedi s';
    const where = [];
    const params = [];

    if (servizio || tipo) {
      query += ' JOIN spazi sp ON s.id = sp.sede_id';
    }

    if (citta) {
      params.push(citta);
      where.push(`s.citta = $${params.length}`);
    }

    if (servizio) {
      // Try common column names for services
      params.push(`%${servizio}%`);
      where.push(`(sp.servizi ILIKE $${params.length} OR sp.servizi_offerti ILIKE $${params.length} OR sp.services ILIKE $${params.length})`);
    }

    if (tipo) {
      params.push(tipo);
      where.push(`sp.tipo_spazio = $${params.length}`);
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

    const tipiResult = await pool.query(
      'SELECT DISTINCT tipo_spazio FROM spazi WHERE tipo_spazio IS NOT NULL'
    );

    const serviziResult = await pool.query(
      "SELECT DISTINCT trim(unnest(string_to_array(servizi, ','))) AS servizio FROM spazi WHERE servizi IS NOT NULL"
    );

    res.json({
      citta: cittaResult.rows.map(r => r.citta),
      tipi: tipiResult.rows.map(r => r.tipo_spazio),
      servizi: serviziResult.rows.map(r => r.servizio),
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
