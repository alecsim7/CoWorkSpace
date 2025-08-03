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
    const result = await pool.query(`
      SELECT s.id AS spazio_id, s.nome AS nome_spazio, s.descrizione, s.prezzo_orario AS prezzo_orario, sede.nome AS nome_sede
      FROM spazi s
      JOIN sedi sede ON s.sede_id = sede.id
      WHERE s.id NOT IN (
        SELECT spazio_id FROM prenotazioni
        WHERE data = $1
        AND NOT (
          orario_fine <= $2 OR
          orario_inizio >= $3
        )
      )
    `, [data, orario_inizio, orario_fine]);

    res.json({ risultati: result.rows });
  } catch (err) {
    console.error('Errore ricerca disponibilità:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

