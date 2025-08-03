// Controlla che tutti i campi richiesti siano presenti
exports.validateRegister = (req, res, next) => {
  const { nome, email, password, ruolo } = req.body;

  if (!nome || !email || !password) {
    return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });
  }

  const ruoliAmmessi = ['cliente', 'gestore', 'admin'];
  if (ruolo && !ruoliAmmessi.includes(ruolo)) {
    return res.status(400).json({ message: 'Ruolo non valido' });
  }

  next(); // Passa al controller
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e password obbligatorie' });
  }

  next();
};

exports.validateUpdateProfilo = (req, res, next) => {
  const { nome, password } = req.body;

  if (!nome && !password) {
    return res
      .status(400)
      .json({ message: 'Fornire almeno nome o password' });
  }

  if (nome && (typeof nome !== 'string' || nome.trim() === '')) {
    return res.status(400).json({ message: 'Nome non valido' });
  }

  if (password && (typeof password !== 'string' || password.length < 6)) {
    return res
      .status(400)
      .json({ message: 'Password non valida (min 6 caratteri)' });
  }

  next();
};
