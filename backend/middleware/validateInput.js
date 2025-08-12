// backend/middleware/validateInput.js
function validateRegister(req, res, next) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Campi mancanti per la registrazione' });
  }
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatorie' });
  }
  next();
}

function validateUpdateProfilo(req, res, next) {
  const { username, email } = req.body;
  if (!username && !email) {
    return res.status(400).json({ error: 'Nessun campo da aggiornare' });
  }
  next();
}

module.exports = { validateRegister, validateLogin, validateUpdateProfilo };
