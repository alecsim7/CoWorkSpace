
exports.verificaAdmin = (req, res, next) => {
  if (req.utente && req.utente.ruolo === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accesso riservato agli admin' });
  }
};
