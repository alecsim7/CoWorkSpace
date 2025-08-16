const pool = require('../db');

// Visualizza tutte le disponibilità per uno spazio specifico
exports.visualizzaDisponibilitaSpazio = async (req, res) => {
  const { spazio_id } = req.params;

  try {
    // Recupera tutte le disponibilità per lo spazio ordinando per data e orario di inizio
    const result = await pool.query(
      `SELECT * FROM disponibilita 
       WHERE spazio_id = $1 
       ORDER BY data, orario_inizio`,
      [spazio_id]
    );
    // Restituisce la lista delle disponibilità
    res.json({ disponibilita: result.rows });
  } catch (err) {
    // Logga e restituisce errore in caso di problemi
    console.error('Errore visualizzazione disponibilità:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// Ricerca disponibilità in base a data e intervallo orario
exports.ricercaDisponibilita = async (req, res) => {
  const { data, orario_inizio, orario_fine, citta } = req.body;

  try {
    // DEBUG: Mostra i parametri ricevuti per la ricerca
    console.log('Parametri ricerca disponibilità:', { data, orario_inizio, orario_fine, citta });

    // Query per trovare spazi disponibili che non hanno prenotazioni sovrapposte
    const result = await pool.query(
      `SELECT s.id AS spazio_id,
              s.nome AS nome_spazio,
              s.descrizione,
              s.prezzo_orario,
              sede.nome AS nome_sede,
              sede.citta AS citta,
              s.capienza - COALESCE(COUNT(p.id), 0) AS posti_liberi
       FROM spazi s
       JOIN sedi sede ON s.sede_id = sede.id
       LEFT JOIN prenotazioni p ON p.spazio_id = s.id
           AND p.data = $1
           AND NOT (p.orario_fine <= $2 OR p.orario_inizio >= $3)
       WHERE ($4::text IS NULL OR sede.citta ILIKE $4)
       GROUP BY s.id, s.nome, s.descrizione, s.prezzo_orario, s.capienza, sede.nome, sede.citta
       HAVING (s.capienza - COALESCE(COUNT(p.id), 0)) > 0`,
      [data, orario_inizio, orario_fine, citta ? `%${citta}%` : null]
    );

    // Restituisce i risultati della ricerca
    res.json({ risultati: result.rows });
  } catch (err) {
    // Logga e restituisce errore in caso di problemi
    console.error('Errore ricerca disponibilità:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

