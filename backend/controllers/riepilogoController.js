const pool = require('../db');

exports.getRiepilogoPrenotazioni = async (req, res) => {
  const gestoreId = req.params.id;

  try {
    // Query che recupera le prenotazioni per tutti gli spazi gestiti dal gestore
    const result = await pool.query(`
      SELECT 
        sedi.nome AS nome_sede,
        spazi.nome AS nome_spazio,
        prenotazioni.data,
        prenotazioni.orario_inizio,
        prenotazioni.orario_fine,
        utenti.nome AS nome_utente
      FROM prenotazioni
      JOIN spazi ON prenotazioni.spazio_id = spazi.id
      JOIN sedi ON spazi.sede_id = sedi.id
      JOIN utenti ON prenotazioni.utente_id = utenti.id
      WHERE sedi.gestore_id = $1
      ORDER BY prenotazioni.data DESC, prenotazioni.orario_inizio
    `, [gestoreId]);

    res.json({ riepilogo: result.rows });
  } catch (err) {
    console.error('Errore recupero riepilogo prenotazioni:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};
