require('dotenv').config(); // Carica variabili d'ambiente dal file .env
const pool = require('../db');
const Stripe = require('stripe');
const logger = require('../utils/logger');

// Controlla che la chiave sia presente
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('La variabile STRIPE_SECRET_KEY non è definita. Aggiungila al file .env.');
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// 1. Registra pagamento
exports.effettuaPagamento = async (req, res) => {
  const { prenotazione_id, metodo, paymentIntentId } = req.body;
  const utente_id = req.utente.id;
  let importoCalcolato = null;
  let providerId = null;
  let stato = null;

  const metodiValidi = ['paypal', 'satispay', 'carta', 'bancomat'];
  if (!metodiValidi.includes(metodo)) {
    logger.warn('Metodo di pagamento non valido', {
      prenotazione_id,
      importo: null,
      metodo,
      esito: 'metodo_non_valido',
    });
    return res.status(400).json({ message: 'Metodo di pagamento non valido' });
  }

  try {
    await pool.query('BEGIN');

    // Recupera la prenotazione e verifica appartenenza all'utente
    const prenRes = await pool.query(
      'SELECT utente_id, spazio_id, data, orario_inizio, orario_fine FROM prenotazioni WHERE id = $1',
      [prenotazione_id]
    );

    if (prenRes.rows.length === 0 || prenRes.rows[0].utente_id !== utente_id) {
      await pool.query('ROLLBACK');
      logger.warn('Prenotazione non trovata', {
        prenotazione_id,
        importo: importoCalcolato,
        metodo,
        esito: 'prenotazione_non_trovata',
      });
      return res.status(404).json({ message: 'Prenotazione non trovata' });
    }

    // Calcola importo usando la tabella spazi e orari della prenotazione
    const spazio_id = prenRes.rows[0].spazio_id;
    const orario_inizio = prenRes.rows[0].orario_inizio;
    const orario_fine = prenRes.rows[0].orario_fine;

    const prezzoRes = await pool.query(
      'SELECT prezzo_orario FROM spazi WHERE id = $1',
      [spazio_id]
    );
    if (prezzoRes.rows.length === 0) {
      await pool.query('ROLLBACK');
      logger.warn('Spazio non trovato', {
        prenotazione_id,
        importo: importoCalcolato,
        metodo,
        esito: 'spazio_non_trovato',
      });
      return res.status(404).json({ message: 'Spazio non trovato' });
    }
    const start = new Date(`1970-01-01T${orario_inizio}`);
    const end = new Date(`1970-01-01T${orario_fine}`);
    const ore = (end - start) / (1000 * 60 * 60);
    const importo = Number(prezzoRes.rows[0].prezzo_orario) * ore;
    importoCalcolato = importo;

    logger.info('Tentativo pagamento', {
      prenotazione_id,
      importo: importoCalcolato,
      metodo,
      esito: 'tentativo',
    });

    // Controlla se esiste già un pagamento per questa prenotazione
    const pagRes = await pool.query(
      'SELECT id FROM pagamenti WHERE prenotazione_id = $1',
      [prenotazione_id]
    );

    if (pagRes.rows.length > 0) {
      await pool.query('ROLLBACK');
      logger.warn('Prenotazione già pagata', {
        prenotazione_id,
        importo: importoCalcolato,
        metodo,
        esito: 'gia_pagata',
      });
      return res.status(400).json({ message: 'Prenotazione già pagata' });
    }

    // Se il metodo è carta, utilizziamo Stripe PaymentIntent
    if (metodo === 'carta') {
      if (!paymentIntentId) {
        // Prima fase: creazione del PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(importo * 100), // in centesimi
          currency: 'eur',
          description: `Prenotazione ${prenotazione_id}`,
          metadata: {
            prenotazione_id: String(prenotazione_id),
            utente_id: String(utente_id)
          }
        });

        await pool.query('COMMIT');
        return res.status(200).json({ clientSecret: paymentIntent.client_secret });

      }

      // Seconda fase: verifica dello stato del PaymentIntent
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        await pool.query('ROLLBACK');
        logger.warn('Pagamento non riuscito', {
          prenotazione_id,
          importo: importoCalcolato,
          metodo,
          esito: 'fallimento',
        });
        return res.status(400).json({ message: 'Pagamento non riuscito' });
      }

      providerId = paymentIntent.id;
      stato = paymentIntent.status;
    }

    await pool.query(
      `INSERT INTO pagamenti (prenotazione_id, importo, metodo, provider_id, stato, timestamp)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [prenotazione_id, importo, metodo, providerId, stato]
    );

    await pool.query('COMMIT');

    logger.info('Pagamento riuscito', {
      prenotazione_id,
      importo: importoCalcolato,
      metodo,
      esito: 'successo',
    });

    res.status(201).json({
      message: 'Pagamento registrato',
      pagamento: { prenotazione_id, importo, metodo, provider_id: providerId, stato }
    });
  } catch (err) {
    await pool.query('ROLLBACK');
    logger.error('Errore pagamento', {
      prenotazione_id,
      importo: importoCalcolato,
      metodo,
      esito: 'errore',
      error: err.message,
    });
    console.error('Errore pagamento:', err);
    res.status(500).json({ message: 'Errore del server durante il pagamento' });
  }
};

// 2. Storico pagamenti
exports.storicoPagamenti = async (req, res) => {
  const utente_id = req.utente.id;
  const limite = parseInt(req.query.limit, 10) || 5;

  try {
    const result = await pool.query(
      `SELECT
        p.timestamp,
        p.metodo,
        p.importo,
        pr.data AS data_prenotazione,
        pr.orario_inizio,
        pr.orario_fine,
        s.nome AS nome_spazio
      FROM pagamenti p
      JOIN prenotazioni pr ON p.prenotazione_id = pr.id
      JOIN spazi s ON pr.spazio_id = s.id
      WHERE pr.utente_id = $1
      ORDER BY p.timestamp DESC
      LIMIT $2`,
      [utente_id, limite]
    );

    res.json({ pagamenti: result.rows });
  } catch (err) {
    console.error('Errore query:', err);
    res
      .status(500)
      .json({ message: 'Errore nel recupero dello storico pagamenti' });
  }
};
