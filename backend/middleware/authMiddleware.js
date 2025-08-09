const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware per verificare la presenza e validità del token JWT
exports.verificaToken = (req, res, next) => {
  // Recupera l'header di autorizzazione
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token mancante' });

  // Estrae il token dall'header
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token non valido' });

  try {
    // Verifica il token e salva i dati utente nella richiesta
    const payload = jwt.verify(token, JWT_SECRET);
    req.utente = payload; // { id, ruolo }
    next();
  } catch {
    // Token non valido o scaduto
    return res.status(403).json({ message: 'Token non valido o scaduto' });
  }
};

// Middleware per autorizzazione ruolo admin
exports.verificaAdmin = (req, res, next) => {
  // Consente l'accesso solo se il ruolo utente è 'admin'
  if (req.utente?.ruolo !== 'admin') {
    return res.status(403).json({ message: 'Accesso negato: solo admin' });
  }
  next();
};

// Middleware per autorizzazione ruolo gestore
exports.verificaGestore = (req, res, next) => {
  // Consente l'accesso solo se il ruolo utente è 'gestore'
  if (req.utente?.ruolo !== 'gestore') {
    return res.status(403).json({ message: 'Accesso negato: solo gestore' });
  }
  next();
};
