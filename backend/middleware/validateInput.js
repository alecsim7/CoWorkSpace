// backend/middleware/validateInput.js

/**
 * Middleware per validare i dati di registrazione.
 * Controlla che nome, email e password siano presenti e che la password rispetti i criteri di sicurezza.
 */
function validateRegister(req, res, next) {
  const { nome, email, password } = req.body;
  // Verifica che tutti i campi richiesti siano presenti
  if (!nome || !email || !password) {
    return res.status(400).json({ error: 'Campi mancanti per la registrazione' });
  }

  // Regex per password: almeno 8 caratteri, una maiuscola, un numero e un carattere speciale
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        'La password deve contenere almeno 8 caratteri, una lettera maiuscola, un numero e un carattere speciale',
    });
  }

  // Se tutto è valido, passa al prossimo middleware
  next();
}

/**
 * Middleware per validare i dati di login.
 * Controlla che email e password siano presenti.
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body;
  // Verifica che email e password siano presenti
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatorie' });
  }
  // Se tutto è valido, passa al prossimo middleware
  next();
}

/**
 * Middleware per validare l'aggiornamento del profilo.
 * Controlla che almeno un campo tra nome, email o password sia presente.
 */
function validateUpdateProfilo(req, res, next) {
  const { nome, email, password } = req.body;
  // Verifica che almeno un campo sia fornito per l'aggiornamento
  if (!nome && !email && !password) {
    return res.status(400).json({ error: 'Nessun campo da aggiornare' });
  }
  // Se tutto è valido, passa al prossimo middleware
  next();
}

module.exports = { validateRegister, validateLogin, validateUpdateProfilo };
