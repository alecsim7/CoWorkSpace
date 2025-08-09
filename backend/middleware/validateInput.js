// Controlla che tutti i campi richiesti siano presenti per la registrazione
exports.validateRegister = (req, res, next) => {
  const { nome, email, password, ruolo } = req.body;

  // Verifica che nome, email e password siano presenti
  if (!nome || !email || !password) {
    return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });
  }

  // Verifica che il ruolo sia tra quelli ammessi (se fornito)
  const ruoliAmmessi = ['cliente', 'gestore', 'admin'];
  if (ruolo && !ruoliAmmessi.includes(ruolo)) {
    return res.status(400).json({ message: 'Ruolo non valido' });
  }

  next(); // Passa al controller se tutto è ok
};

// Controlla che email e password siano presenti per il login
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e password obbligatorie' });
  }

  next();
};

// Valida i dati per l'aggiornamento del profilo utente
exports.validateUpdateProfilo = (req, res, next) => {
  const { nome, password } = req.body;

  // Almeno uno tra nome o password deve essere fornito
  if (!nome && !password) {
    return res
      .status(400)
      .json({ message: 'Fornire almeno nome o password' });
  }

  // Se nome è fornito, deve essere una stringa non vuota
  if (nome && (typeof nome !== 'string' || nome.trim() === '')) {
    return res.status(400).json({ message: 'Nome non valido' });
  }

  // Se password è fornita, deve essere una stringa di almeno 6 caratteri
  if (password && (typeof password !== 'string' || password.length < 6)) {
    return res
      .status(400)
      .json({ message: 'Password non valida (min 6 caratteri)' });
  }

  next();
};
