const db = require('../db');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token mancante' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verifica il token nella tabella sessioni/utenti
    const result = await db.query(
      'SELECT utente_id FROM sessioni WHERE token = $1 AND scadenza > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Sessione non valida' });
    }

    req.user = { id: result.rows[0].utente_id };
    next();
  } catch (err) {
    console.error('Errore autenticazione:', err);
    res.status(401).json({ message: 'Errore di autenticazione' });
  }
};

module.exports = auth;
