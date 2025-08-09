const pool = require('../db');

// 1. Elenco utenti: restituisce tutti gli utenti con id, nome, email e ruolo
exports.getUtenti = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, email, ruolo FROM utenti');
    res.json(result.rows);
  } catch (err) {
    console.error('Errore utenti:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// 2. Elenco sedi: restituisce tutte le sedi
exports.getSedi = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sedi');
    res.json(result.rows);
  } catch (err) {
    console.error('Errore recupero sedi:', err);
    res.status(500).json({ message: 'Errore del server' });
  }
};

// 3. Elimina utente: elimina prima le sedi gestite dall'utente, poi elimina l'utente stesso
exports.eliminaUtente = async (req, res) => {
  const { id } = req.params;
  try {
    // Elimina tutte le sedi dove l'utente è gestore
    await pool.query('DELETE FROM sedi WHERE gestore_id = $1', [id]);

    // Elimina l'utente
    await pool.query('DELETE FROM utenti WHERE id = $1', [id]);
    res.json({ message: 'Utente eliminato' });
  } catch (err) {
    console.error('Errore eliminazione utente:', err);
    res.status(500).json({ message: 'Errore del server', error: err.message, stack: err.stack });
  }
};

// 4. Elimina sede: elimina pagamenti, prenotazioni, spazi e infine la sede
exports.eliminaSede = async (req, res) => {
  const { id } = req.params;

  try {
    // Trova tutte le prenotazioni associate agli spazi della sede
    const prenotazioniRes = await pool.query(
      `SELECT p.id FROM prenotazioni p
       JOIN spazi s ON p.spazio_id = s.id
       WHERE s.sede_id = $1`,
      [id]
    );
    const prenotazioneIds = prenotazioniRes.rows.map(r => r.id);

    // Elimina pagamenti associati alle prenotazioni trovate
    if (prenotazioneIds.length > 0) {
      await pool.query(
        `DELETE FROM pagamenti WHERE prenotazione_id = ANY($1::int[])`,
        [prenotazioneIds]
      );
    }

    // Elimina le prenotazioni associate agli spazi della sede
    if (prenotazioneIds.length > 0) {
      await pool.query(
        `DELETE FROM prenotazioni WHERE id = ANY($1::int[])`,
        [prenotazioneIds]
      );
    }

    // Elimina tutti gli spazi associati alla sede
    await pool.query('DELETE FROM spazi WHERE sede_id = $1', [id]);

    // Elimina la sede stessa
    await pool.query('DELETE FROM sedi WHERE id = $1', [id]);

    res.json({ message: 'Sede eliminata' });
  } catch (err) {
    console.error('Errore eliminazione sede:', err);
    res.status(500).json({ message: 'Errore del server', error: err.message, stack: err.stack });
  }
};
