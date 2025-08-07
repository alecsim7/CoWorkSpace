const pool = require('../db');

exports.visualizzaDisponibilitaSpazio = async (req, res) => {
  const { spazio_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM disponibilita 
       WHERE spazio_id = $1 
       ORDER BY data, orario_inizio`,
      [spazio_id]
    );
    res.json({ disponibilita: result.rows });
  } catch (err) {
    console.error('Errore visualizzazione disponibilità:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

exports.ricercaDisponibilita = async (req, res) => {
  const { data, orario_inizio, orario_fine } = req.body;

  try {
    // DEBUG: Mostra i parametri ricevuti
    console.log('Parametri ricerca disponibilità:', { data, orario_inizio, orario_fine });

    const result = await pool.query(
      `SELECT s.id AS spazio_id,
              s.nome AS nome_spazio,
              s.descrizione,
              s.prezzo_orario,
              sede.nome AS nome_sede,
              s.capienza - COALESCE(COUNT(p.id), 0) AS posti_liberi
       FROM spazi s
       JOIN sedi sede ON s.sede_id = sede.id
       LEFT JOIN prenotazioni p ON p.spazio_id = s.id
           AND p.data = $1
           AND NOT (p.orario_fine <= $2 OR p.orario_inizio >= $3)
       GROUP BY s.id, s.nome, s.descrizione, s.prezzo_orario, s.capienza, sede.nome
       HAVING (s.capienza - COALESCE(COUNT(p.id), 0)) > 0`,
      [data, orario_inizio, orario_fine]
    );

    res.json({ risultati: result.rows });
  } catch (err) {
    console.error('Errore ricerca disponibilità:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

