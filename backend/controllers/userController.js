const pool = require('../db');
const bcrypt = require('bcrypt');

// [DEPRECATO] Visualizza il profilo utente tramite ID
// Utilizzare invece la rotta autenticata `/api/utente/me`
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

// Recupera il profilo dell'utente autenticato
exports.getProfiloAutenticato = async (req, res) => {
  const id = req.utente.id;

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
    console.error('Errore recupero profilo autenticato:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// Aggiorna il profilo utente
exports.updateProfilo = async (req, res) => {
  const id = req.utente.id;
  const { nome, password } = req.body;

  try {
    let hashedPassword;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      const current = await pool.query('SELECT password FROM utenti WHERE id = $1', [id]);
      if (current.rows.length === 0) {
        return res.status(404).json({ message: 'Utente non trovato' });
      }
      hashedPassword = current.rows[0].password;
    }

    const result = await pool.query(
      'UPDATE utenti SET nome=$1, password=$2 WHERE id=$3 RETURNING id,nome,email,ruolo',
      [nome, hashedPassword, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.json({ utente: result.rows[0] });
  } catch (err) {
    console.error('Errore aggiornamento profilo:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};
