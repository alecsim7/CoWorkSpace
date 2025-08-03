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
      // RIMOSSO: importo dalla SELECT
      'SELECT utente_id, spazio_id, data, orario_inizio, orario_fine FROM prenotazioni WHERE id = $1',
      [prenotazione_id]
    );

    if (prenRes.rows.length === 0 || prenRes.rows[0].utente_id !== utente_id) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Prenotazione non trovata' });
    }

    // Calcola importo usando la tabella spazi e orari della prenotazione
    const spazio_id = prenRes.rows[0].spazio_id;
    const data = prenRes.rows[0].data;
    const orario_inizio = prenRes.rows[0].orario_inizio;
    const orario_fine = prenRes.rows[0].orario_fine;

    const prezzoRes = await pool.query(
      'SELECT prezzo_ora AS prezzo_orario FROM spazi WHERE id = $1',
      [spazio_id]
    );
    if (prezzoRes.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Spazio non trovato' });
    }
    const start = new Date(`1970-01-01T${orario_inizio}`);
    const end = new Date(`1970-01-01T${orario_fine}`);
    const ore = (end - start) / (1000 * 60 * 60);
    const importo = Number(prezzoRes.rows[0].prezzo_orario) * ore;

    // Controlla se esiste già un pagamento per questa prenotazione
    const pagRes = await pool.query(
      'SELECT id FROM pagamenti WHERE prenotazione_id = $1',
      [prenotazione_id]
    );

    if (pagRes.rows.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ message: 'Prenotazione già pagata' });
    }

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
