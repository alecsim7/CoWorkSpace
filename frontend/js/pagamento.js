// Base API: meta[name="api-base"] nel tuo HTML o default a CloudFront /api
const API_BASE = (() => {
  const meta = document.querySelector('meta[name="api-base"]');
  return (meta && meta.content ? meta.content.trim() : 'https://d1qgb2todm35gi.cloudfront.net/api');
})();

$(document).ready(async function () {
  // Aggiorna il meta tag in locale
  const apiBaseMeta = document.querySelector('meta[name="api-base"]');
  if (
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    && apiBaseMeta
  ) {
    apiBaseMeta.setAttribute('content', 'http://localhost:3001/api');
  }
  // Leggi il valore aggiornato
  const API_BASE = apiBaseMeta ? apiBaseMeta.content.trim() : '/api';

  // Token/utente
  const token = localStorage.getItem('token');
  const utente = JSON.parse(localStorage.getItem('utente'));

  if (!token || !utente) {
    alert("Effettua il login per accedere al pagamento.");
    window.location.href = "index.html";
    return;
  }

  // Carica lo storico dei pagamenti al caricamento della pagina
  caricaStoricoPagamenti();

  // Inizializzazione Stripe
  let stripe = null;
  let card = null;

  try {
    // 1) recupera la publishable key dal backend
    const resp = await fetch(`${API_BASE}/config/stripe`, { credentials: 'omit' });
    if (!resp.ok) throw new Error(`Stripe config ${resp.status}`);
    const { publishableKey } = await resp.json();

    // 2) sanity check
    if (!/^pk_(test|live)_/.test(publishableKey || '')) {
      throw new Error('Publishable key Stripe non valida o mancante');
    }

    // 3) inizializza Stripe
    stripe = Stripe(publishableKey);
    const elements = stripe.elements();
    card = elements.create('card');

    // Mostra il widget carta quando selezionato
    $('#metodo').off('change').on('change', function () {
      if ($(this).val() === 'carta') {
        $('#card-element').removeClass('d-none');
        if (!card._mounted) {
          card.mount('#card-element');
          card._mounted = true;
        }
      } else {
        $('#card-element').addClass('d-none');
        $('#card-errors').text('');
      }
    }).trigger('change');

  } catch (e) {
    console.error('Errore configurazione Stripe:', e);
    // Disabilita carta se Stripe non disponibile
    $('#metodo option[value="carta"]').prop('disabled', true)
      .text('💳 Carta di Credito (non disponibile)');
    $('#alertPagamento').html(
      '<div class="alert alert-warning">Il pagamento con carta non è al momento disponibile.</div>'
    );
  }

  let prenotazioni = [];

  function mostraRiepilogoPrenotazione(prenotazione) {
    const riepilogo = `
      <div class="row">
        <div class="col-md-6">
          <p><strong>Spazio:</strong> ${prenotazione.nome_spazio}</p>
          <p><strong>Data:</strong> ${prenotazione.data}</p>
        </div>
        <div class="col-md-6">
          <p><strong>Orario:</strong> ${prenotazione.orario_inizio.slice(0,5)} - ${prenotazione.orario_fine.slice(0,5)}</p>
          <p><strong>Prezzo orario:</strong> €${prenotazione.prezzo_orario}</p>
        </div>
      </div>
    `;
    $('#riepilogoPrenotazione').html(riepilogo);
  }

  function calcolaImporto(prenotazione) {
    if (!prenotazione.prezzo_orario || !prenotazione.orario_inizio || !prenotazione.orario_fine) return null;
    const inizio = prenotazione.orario_inizio.slice(0,5);
    const fine = prenotazione.orario_fine.slice(0,5);
    const [hStart, mStart] = inizio.split(':').map(Number);
    const [hEnd, mEnd] = fine.split(':').map(Number);
    const ore = (hEnd + mEnd/60) - (hStart + mStart/60);
    return parseFloat(prenotazione.prezzo_orario) * ore;
  }

  // Carica prenotazioni non pagate
  $.ajax({
    url: `${API_BASE}/prenotazioni/non-pagate`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    success: function(res) {
      prenotazioni = res.prenotazioni || [];

      if (prenotazioni.length === 0) {
        $('#alertPagamento').html('<div class="alert alert-info">Nessuna prenotazione da pagare.</div>');
        $('#formPagamento').hide();
        return;
      }

      prenotazioni.forEach(p => {
        let importo = null;
        const prezzoOrario = p.prezzo_orario;
        const inizio = p.orario_inizio ? p.orario_inizio.slice(0,5) : '';
        const fine   = p.orario_fine   ? p.orario_fine.slice(0,5)   : '';

        if (prezzoOrario && inizio && fine) {
          const [hStart, mStart] = inizio.split(':').map(Number);
          const [hEnd, mEnd] = fine.split(':').map(Number);
          const ore = (hEnd + mEnd/60) - (hStart + mStart/60);
          importo = parseFloat(prezzoOrario) * ore;
        }

        const testoImporto = (importo !== null && !isNaN(importo) && importo > 0)
          ? `€${importo.toFixed(2)}`
          : 'Importo non disponibile';
        const testo = `#${p.id} - ${p.nome_spazio} ${p.data} ${inizio}-${fine} (${testoImporto})`;
        const dataImporto = (importo !== null && !isNaN(importo) && importo > 0) ? importo : '';

        $('#prenotazione').append(
          `<option value="${p.id}" data-importo="${dataImporto}">${testo}</option>`
        );
      });

      $('#prenotazione').off('change').on('change', function () {
        const imp = parseFloat($('#prenotazione option:selected').data('importo'));
        if (!isNaN(imp)) {
          $('#importoDaPagare').text(`Importo: €${imp.toFixed(2)}`);
        } else {
          $('#importoDaPagare').text('Importo non disponibile');
        }
        const id = parseInt($(this).val());
        const pr = prenotazioni.find(p => p.id === id);
        if (pr) {
          mostraRiepilogoPrenotazione(pr);
          const importo = calcolaImporto(pr);
          $('#importoDaPagare').text(
            importo ? `Importo totale da pagare: €${importo.toFixed(2)}` : 'Importo non disponibile'
          );
        }
      }).trigger('change');
    },
    error: function (xhr) {
      console.error('Errore AJAX:', xhr.status, xhr.responseText);
      $('#alertPagamento').html(`<div class="alert alert-danger">Errore nel recupero delle prenotazioni. (${xhr.status})</div>`);
    }
  });

  // Submit pagamento
  $('#formPagamento').off('submit').on('submit', async function (e) {
    e.preventDefault();

    const $submitBtn = $(this).find('button[type="submit"]');
    $submitBtn.prop('disabled', true);
    $('#paymentSpinner').removeClass('d-none');

    const prenotazione_id = parseInt($('#prenotazione').val());
    const metodo = $('#metodo').val();

    try {
      if (metodo === 'carta' && stripe) {
        // 1) Crea PaymentIntent
        const initRes = await $.ajax({
          url: `${API_BASE}/pagamenti/pagamento`,
          method: 'POST',
          contentType: 'application/json',
          headers: { Authorization: `Bearer ${token}` },
          data: JSON.stringify({ prenotazione_id, metodo })
        });

        // 2) Conferma pagamento (3DS se richiesto)
        const result = await stripe.confirmCardPayment(initRes.clientSecret, {
          payment_method: { card }
        });

        if (result.error || result.paymentIntent.status !== 'succeeded') {
          $('#card-errors').text(result.error ? result.error.message : 'Pagamento non riuscito');
          return;
        }

        // 3) Registra pagamento sul backend
        const finalRes = await $.ajax({
          url: `${API_BASE}/pagamenti/pagamento`,
          method: 'POST',
          contentType: 'application/json',
          headers: { Authorization: `Bearer ${token}` },
          data: JSON.stringify({
            prenotazione_id,
            metodo,
            paymentIntentId: result.paymentIntent.id
          })
        });

        $('#alertPagamento').html(`
          <div class="alert alert-success d-flex align-items-center">
            <i class="bi bi-check-circle-fill me-2"></i>
            ${finalRes.message}
          </div>
        `);
      } else {
        // Pagamento alternativo (es. cash/bonifico)
        const res = await $.ajax({
          url: `${API_BASE}/pagamenti/pagamento`,
          method: 'POST',
          contentType: 'application/json',
          headers: { Authorization: `Bearer ${token}` },
          data: JSON.stringify({ prenotazione_id, metodo })
        });

        $('#alertPagamento').html(`
          <div class="alert alert-success d-flex align-items-center">
            <i class="bi bi-check-circle-fill me-2"></i>
            ${res.message}
          </div>
        `);
      }

      // Pulizia UI
      $('#prenotazione option:selected').remove();
      $('#formPagamento')[0].reset();
      $('#importoDaPagare').empty();
      if ($('#prenotazione option').length === 0) {
        $('#formPagamento').hide();
      }
      // Aggiorna storico
      caricaStoricoPagamenti();

    } catch (xhr) {
      $('#alertPagamento').html(`
        <div class="alert alert-danger d-flex align-items-center">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          ${xhr.responseJSON?.message || 'Errore durante il pagamento'}
        </div>
      `);
    } finally {
      $submitBtn.prop('disabled', false);
      $('#paymentSpinner').addClass('d-none');
    }
  });

  // Storico pagamenti
  function caricaStoricoPagamenti() {
    $.ajax({
      url: `${API_BASE}/pagamenti/storico?limit=5`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      success: function(res) {
        const pagamenti = res.pagamenti || [];
        const tbody = $('#storicoPagamenti');
        tbody.empty();

        if (pagamenti.length === 0) {
          tbody.append('<tr><td colspan="5" class="text-center">Nessun pagamento effettuato</td></tr>');
          return;
        }

        pagamenti.forEach(p => {
          const data = new Date(p.timestamp).toLocaleString('it-IT', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          });
          const dataPrenotazione = new Date(p.data_prenotazione).toLocaleDateString('it-IT');

          tbody.append(`
            <tr>
              <td>${data}</td>
              <td>${p.nome_spazio}</td>
              <td>${dataPrenotazione} ${p.orario_inizio.slice(0,5)}-${p.orario_fine.slice(0,5)}</td>
              <td>€${parseFloat(p.importo).toFixed(2)}</td>
              <td>${p.metodo}</td>
            </tr>
          `);
        });
      },
      error: function(xhr) {
        console.error('Errore caricamento storico:', xhr.status, xhr.responseText);
        $('#storicoPagamenti').html(`
          <tr><td colspan="5" class="text-center text-danger">
            Errore nel caricamento dello storico pagamenti
          </td></tr>
        `);
      }
    });
  }

  // Logout
  $('#logoutBtn').click(function () {
    localStorage.removeItem('token');
    localStorage.removeItem('utente');
    window.location.href = "index.html";
  });
});