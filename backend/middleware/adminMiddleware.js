// Middleware per verificare che l'utente sia un admin
exports.verificaAdmin = (req, res, next) => {
  // Controlla che l'oggetto utente esista e che il ruolo sia 'admin'
  if (req.utente && req.utente.ruolo === 'admin') {
    next(); // Utente admin: prosegui con la richiesta
  } else {
    // Utente non admin: restituisci errore 403 (forbidden)
    res.status(403).json({ message: 'Accesso riservato agli admin' });
  }
};
