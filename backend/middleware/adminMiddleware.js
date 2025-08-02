
exports.verificaAdmin = (req, res, next) => {
  if (req.utente && req.utente.ruolo === 'amministratore') {
    next();
  } else {
    res.status(403).json({ message: 'Accesso riservato agli amministratori' });
  }
};
