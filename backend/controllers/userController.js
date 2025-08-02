const pool = require('../db');

// Visualizza il profilo utente
exports.getProfilo = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, nome, email, ruolo FROM utenti WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.json({ utente: result.rows[0] });

  } catch (err) {
    console.error('Errore recupero profilo:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};
