const pool = require('../db');
const bcrypt = require('bcrypt');


exports.getProfilo = async (req, res) => {
  const { id } = req.params;

  try {
    // Recupera dati utente dal database tramite ID
    const result = await pool.query(
      'SELECT id, nome, email, ruolo FROM utenti WHERE id = $1',
      [id]
    );

    // Se l'utente non esiste, restituisci errore 404
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Restituisci i dati dell'utente
    res.json({ utente: result.rows[0] });

  } catch (err) {
    // Logga e restituisce errore generico in caso di problemi
    console.error('Errore recupero profilo:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// Recupera il profilo dell'utente autenticato (tramite token)
exports.getProfiloAutenticato = async (req, res) => {
  const id = req.utente.id;

  try {
    // Recupera dati utente dal database tramite ID autenticato
    const result = await pool.query(
      'SELECT id, nome, email, ruolo FROM utenti WHERE id = $1',
      [id]
    );

    // Se l'utente non esiste, restituisci errore 404
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Restituisci i dati dell'utente autenticato
    res.json({ utente: result.rows[0] });
  } catch (err) {
    // Logga e restituisce errore generico in caso di problemi
    console.error('Errore recupero profilo autenticato:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// Aggiorna il profilo utente (nome e/o password)
exports.updateProfilo = async (req, res) => {
  const id = req.utente.id;
  const { nome, password } = req.body;

  try {
    let hashedPassword;

    // Se viene fornita una nuova password, hashala
    if (password) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          message:
            'La password deve contenere almeno 8 caratteri, una lettera maiuscola, un numero e un carattere speciale',
        });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      // Altrimenti recupera la password attuale dal database
      const current = await pool.query('SELECT password FROM utenti WHERE id = $1', [id]);
      if (current.rows.length === 0) {
        return res.status(404).json({ message: 'Utente non trovato' });
      }
      hashedPassword = current.rows[0].password;
    }

    // Aggiorna nome e password dell'utente
    const result = await pool.query(
      'UPDATE utenti SET nome=$1, password=$2 WHERE id=$3 RETURNING id,nome,email,ruolo',
      [nome, hashedPassword, id]
    );

    // Se l'utente non esiste, restituisci errore 404
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Restituisci i dati aggiornati dell'utente
    res.json({ utente: result.rows[0] });
  } catch (err) {
    // Logga e restituisce errore generico in caso di problemi
    console.error('Errore aggiornamento profilo:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};
