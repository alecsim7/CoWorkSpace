const pool = require('../db');

// 1. Elenco utenti
exports.getUtenti = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, email, ruolo FROM utenti');
    res.json(result.rows);
  } catch (err) {
    console.error('Errore utenti:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// 2. Elenco sedi
exports.getSedi = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sedi');
    res.json(result.rows);
  } catch (err) {
    console.error('Errore recupero sedi:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// 3. Elimina utente
exports.eliminaUtente = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM utenti WHERE id = $1', [id]);
    res.json({ message: 'Utente eliminato' });
  } catch (err) {
    console.error('Errore eliminazione utente:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};



// 4. Elimina sede
exports.eliminaSede = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM sedi WHERE id = $1', [id]);
    res.json({ message: 'Sede eliminata' });
  } catch (err) {
    console.error('Errore eliminazione sede:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};
