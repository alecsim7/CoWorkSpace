// Simula autenticazione con un ID utente finto passato nell'header
exports.authMiddleware = (req, res, next) => {
  const userId = req.header('X-User-Id');

  if (!userId) {
    return res.status(401).json({ message: 'Utente non autenticato' });
  }

  req.utente_id = userId; // Salva ID per i controller
  next();
};
