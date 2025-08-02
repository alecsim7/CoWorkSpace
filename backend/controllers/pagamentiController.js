const pool = require('../db');

// 1. Registra pagamento
exports.effettuaPagamento = async (req, res) => {
  const { utente_id, importo } = req.body;

  try {
    // Simulazione del pagamento
    console.log(`💳 Pagamento simulato da utente ${utente_id}, importo €${importo}`);

    res.status(200).json({
      message: 'Pagamento effettuato con successo (simulato)',
      pagamento: {
        utente_id,
        importo,
        data: new Date().toISOString(),
        stato: 'successo'
      }
    });
  } catch (err) {
    console.error('Errore pagamento:', err);
    res.status(500).json({ message: 'Errore del server durante il pagamento' });
  }
};
