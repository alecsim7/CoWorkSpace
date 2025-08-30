// backend/middleware/validateInput.js
function validateRegister(req, res, next) {
  const { nome, email, password } = req.body;
  if (!nome || !email || !password) {
    return res.status(400).json({ error: 'Campi mancanti per la registrazione' });
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        'La password deve contenere almeno 8 caratteri, una lettera maiuscola, un numero e un carattere speciale',
    });
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
  const { nome, email, password } = req.body;
  if (!nome && !email && !password) {
    return res.status(400).json({ error: 'Nessun campo da aggiornare' });
  }
  next();
}

module.exports = { validateRegister, validateLogin, validateUpdateProfilo };
