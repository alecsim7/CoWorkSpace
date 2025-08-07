const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.verificaToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token mancante' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token non valido' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.utente = payload; // { id, ruolo }
    next();
  } catch {
    return res.status(403).json({ message: 'Token non valido o scaduto' });
  }
};

// Middleware per autorizzazione ruolo admin
exports.verificaAdmin = (req, res, next) => {
  if (req.utente?.ruolo !== 'admin') {
    return res.status(403).json({ message: 'Accesso negato: solo admin' });
  }
  next();
};

// Middleware per autorizzazione ruolo gestore
exports.verificaGestore = (req, res, next) => {
  if (req.utente?.ruolo !== 'gestore') {
    return res.status(403).json({ message: 'Accesso negato: solo gestore' });
  }
  next();
};
