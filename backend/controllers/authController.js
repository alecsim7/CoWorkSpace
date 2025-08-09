const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Registrazione
exports.register = async (req, res) => {
  const { nome, email, password, ruolo } = req.body;

  try {
    const check = await pool.query('SELECT * FROM utenti WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ message: 'Email già registrata' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO utenti (nome, email, password, ruolo) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, ruolo',
      [nome, email, hashedPassword, ruolo || 'cliente']
    );

    res.status(201).json({
      message: 'Registrazione avvenuta con successo',
      utente: result.rows[0],
    });

  } catch (err) {
    console.error('Errore registrazione:', err);
    res.status(500).json({ message: 'Errore del server durante la registrazione' });
  }
};

// Login con generazione JWT
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM utenti WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email non trovata' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Password non corretta' });
    }

    // Genera token JWT
    const token = jwt.sign(
      { id: user.id, ruolo: user.ruolo },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      message: 'Login riuscito',
      token,
      utente: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        ruolo: user.ruolo
      }
    });

  } catch (err) {
    console.error('Errore login:', err);
    res.status(500).json({ message: 'Errore del server durante il login' });
  }
};

//Logout placeholder
exports.logout = (req, res) => {
  // Con JWT il logout si implementa lato client (rimozione token)
  res.json({ message: 'Logout simulato: cancella il token dal client' });
};
