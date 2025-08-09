// Simula autenticazione usando un ID utente finto passato nell'header HTTP
exports.authMiddleware = (req, res, next) => {
  // Recupera l'ID utente dall'header personalizzato 'X-User-Id'
  const userId = req.header('X-User-Id');

  // Se l'ID utente non è presente, restituisce errore 401 (non autenticato)
  if (!userId) {
    return res.status(401).json({ message: 'Utente non autenticato' });
  }

  // Salva l'ID utente nella richiesta per essere usato dai controller
  req.utente_id = userId;
  next(); // Passa al prossimo middleware o controller
};
