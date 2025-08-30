const pool = require('../db');

// Helper per trovare la colonna che rappresenta il tipo di spazio.
// Cerca tra: tipo_spazio, tipo, tipologia.
// Restituisce il nome della colonna trovata o undefined.
async function resolveTipoColumn() {
  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'spazi'
       AND column_name IN ('tipo_spazio', 'tipo', 'tipologia')
     LIMIT 1`
  );
  return result.rows[0]?.column_name;
}

// Helper per trovare la colonna che contiene i servizi.
// Cerca tra: servizi, servizi_offerti, services.
// Restituisce il nome della colonna trovata o undefined.
async function resolveServiziColumn() {
  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'spazi'
       AND column_name IN ('servizi', 'servizi_offerti', 'services')
     LIMIT 1`
  );
  return result.rows[0]?.column_name;
}

// Recupera sedi con filtri opzionali per città, tipo spazio e servizi
exports.getSedi = async (req, res) => {
  try {
    const { citta, servizio, tipo } = req.query;

    // Determina i nomi delle colonne per tipo spazio e servizi
    const tipoColumn = await resolveTipoColumn();
    const serviziColumn = await resolveServiziColumn();

    let query = 'SELECT DISTINCT s.* FROM sedi s';
    const where = [];
    const params = [];

    // Se ci sono filtri su servizi o tipo, fai join con tabella spazi
    if ((servizio && serviziColumn) || (tipo && tipoColumn)) {
      query += ' JOIN spazi sp ON s.id = sp.sede_id';
    }

    // Filtro per città
    if (citta) {
      params.push(citta);
      where.push(`s.citta = $${params.length}`);
    }

    // Filtro per servizi
    if (servizio && serviziColumn) {
      params.push(`%${servizio}%`);
      where.push(`sp.${serviziColumn} ILIKE $${params.length}`);
    }

    // Filtro per tipo spazio
    if (tipo && tipoColumn) {
      params.push(tipo);
      where.push(`sp.${tipoColumn} = $${params.length}`);
    }

    // Costruisci la clausola WHERE se ci sono filtri
    if (where.length > 0) {
      query += ' WHERE ' + where.join(' AND ');
    }

    // Esegui la query e restituisci le sedi filtrate
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Errore nel recupero sedi:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// Restituisce liste di valori per filtri pubblici (città, tipi, servizi)
exports.getOpzioni = async (req, res) => {
  try {
    // Recupera tutte le città disponibili
    const cittaResult = await pool.query('SELECT DISTINCT citta FROM sedi');

    // Recupera tutti i tipi di spazio disponibili
    const tipoColumn = await resolveTipoColumn();
    let tipi = [];
    if (tipoColumn) {
      const tipiResult = await pool.query(
        `SELECT DISTINCT ${tipoColumn} AS tipo FROM spazi WHERE ${tipoColumn} IS NOT NULL`
      );
      tipi = tipiResult.rows.map(r => r.tipo);
    }

    // Recupera tutti i servizi disponibili
    const serviziColumn = await resolveServiziColumn();
    let servizi = [];
    if (serviziColumn) {
      const serviziResult = await pool.query(
        `SELECT DISTINCT trim(unnest(string_to_array(${serviziColumn}, ','))) AS servizio
         FROM spazi WHERE ${serviziColumn} IS NOT NULL`
      );
      servizi = serviziResult.rows.map(r => r.servizio);
    }

    // Restituisce le opzioni come JSON
    res.json({
      citta: cittaResult.rows.map(r => r.citta),
      tipi,
      servizi,
    });
  } catch (err) {
    console.error('Errore nel recupero opzioni sedi:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// Recupera sedi di un gestore (solo se autenticato come gestore)
exports.getSediGestore = async (req, res) => {
  const { id } = req.params;
  const requestedId = parseInt(id, 10);
  // Controllo che l'utente sia il gestore richiesto
  if (req.utente.id !== requestedId) {
    return res.status(403).json({ message: 'Accesso negato' });
  }
  try {
    // Restituisce id, nome e città delle sedi gestite
    const result = await pool.query(
      'SELECT id, nome, citta FROM sedi WHERE gestore_id = $1',
      [requestedId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Errore lettura sedi:', err);
    res.status(500).json({ message: 'Errore server durante lettura sedi' });
  }
};

// Aggiunta nuova sede (solo gestore autenticato)
exports.aggiungiSede = async (req, res) => {
  const { nome, citta, indirizzo, gestore_id } = req.body;
  const gestoreId = parseInt(gestore_id, 10);

  // Controllo che l'utente sia il gestore che sta aggiungendo la sede
  if (req.utente.id !== gestoreId) {
    return res.status(403).json({ message: 'Accesso negato' });
  }

  try {
    // Inserisce la nuova sede e restituisce i dati
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
    // Recupera i dati della sede
    const sedeResult = await pool.query('SELECT * FROM sedi WHERE id = $1', [id]);

    if (sedeResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sede non trovata' });
    }

    // Recupera tutti gli spazi associati alla sede
    const spaziResult = await pool.query('SELECT * FROM spazi WHERE sede_id = $1', [id]);

    // Aggiunge gli spazi all'oggetto sede
    const sede = sedeResult.rows[0];
    sede.spazi = spaziResult.rows;

    // Restituisce la sede con i suoi spazi
    res.json(sede);
  } catch (err) {
    console.error('Errore recupero sede:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};
