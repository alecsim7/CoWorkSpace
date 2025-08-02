// Controlla che tutti i campi richiesti siano presenti
exports.validateRegister = (req, res, next) => {
  const { nome, email, password } = req.body;

  if (!nome || !email || !password) {
    return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });
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
