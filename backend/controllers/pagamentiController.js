const pool = require('../db');

// 1. Registra pagamento
exports.effettuaPagamento = async (req, res) => {
  const { prenotazione_id, metodo } = req.body;
  const utente_id = req.utente.id;


  const metodiValidi = ['paypal', 'satispay', 'carta', 'bancomat'];
  if (!metodiValidi.includes(metodo)) {
    return res.status(400).json({ message: 'Metodo di pagamento non valido' });
  }

  try {
    await pool.query('BEGIN');

    // Recupera la prenotazione e verifica appartenenza all'utente
    const prenRes = await pool.query(
      'SELECT importo, utente_id FROM prenotazioni WHERE id = $1',
      [prenotazione_id]
    );

    if (prenRes.rows.length === 0 || prenRes.rows[0].utente_id !== utente_id) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Prenotazione non trovata' });
    }

    // Controlla se esiste già un pagamento per questa prenotazione
    const pagRes = await pool.query(
      'SELECT id FROM pagamenti WHERE prenotazione_id = $1',
      [prenotazione_id]
    );

    if (pagRes.rows.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ message: 'Prenotazione già pagata' });
    }

    const importo = prenRes.rows[0].importo;

    await pool.query(
      `INSERT INTO pagamenti (prenotazione_id, importo, metodo, timestamp)
       VALUES ($1, $2, $3, NOW())`,
      [prenotazione_id, importo, metodo]
    );

    await pool.query('COMMIT');

    res.status(201).json({
      message: 'Pagamento registrato',
      pagamento: { prenotazione_id, importo, metodo }

    });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Errore pagamento:', err);
    res.status(500).json({ message: 'Errore del server durante il pagamento' });
  }
};
