const db = require('../db');

// Middleware di autenticazione per verificare il token JWT/sessione
const auth = async (req, res, next) => {
  try {
    // Recupera l'header di autorizzazione
    const authHeader = req.headers.authorization;
    // Controlla che il token sia presente e abbia il formato corretto
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token mancante' });
    }

    // Estrae il token dall'header
    const token = authHeader.split(' ')[1];
    
    // Verifica il token nella tabella sessioni e che non sia scaduto
    const result = await db.query(
      'SELECT utente_id FROM sessioni WHERE token = $1 AND scadenza > NOW()',
      [token]
    );

    // Se il token non è valido o la sessione è scaduta, restituisce errore
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Sessione non valida' });
    }

    // Salva l'id utente nella richiesta per i middleware/route successivi
    req.user = { id: result.rows[0].utente_id };
    next(); // Passa al prossimo middleware o route
  } catch (err) {
    // Logga e restituisce errore di autenticazione in caso di problemi
    console.error('Errore autenticazione:', err);
    res.status(401).json({ message: 'Errore di autenticazione' });
  }
};

module.exports = auth;
