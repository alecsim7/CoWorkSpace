const pool = require('../db');

exports.getRiepilogoPrenotazioni = async (req, res) => {
  const gestoreId = parseInt(req.params.id, 10);

  if (req.utente.id !== gestoreId) {
    return res.status(403).json({ message: 'Accesso negato' });
  }

  try {
    // Query che aggrega il numero di prenotazioni per ogni spazio gestito dal gestore
    const result = await pool.query(
      `SELECT
         sedi.nome AS nome_sede,
         spazi.nome AS nome_spazio,
         spazi.image_url,
         COUNT(prenotazioni.id) AS totale_prenotazioni
       FROM spazi
       JOIN sedi ON spazi.sede_id = sedi.id
       LEFT JOIN prenotazioni ON prenotazioni.spazio_id = spazi.id
       WHERE sedi.gestore_id = $1
       GROUP BY spazi.id, sedi.nome, spazi.nome, spazi.image_url
       ORDER BY sedi.nome, spazi.nome`,
      [gestoreId]
    );

    const riepilogo = result.rows.map(r => ({
      ...r,
      totale_prenotazioni: parseInt(r.totale_prenotazioni, 10) || 0,
    }));

    res.json({ riepilogo });
  } catch (err) {
    console.error('Errore recupero riepilogo prenotazioni:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};
