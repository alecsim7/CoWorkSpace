const API_BASE = `${API_BASE_URL}/api`;

$(document).ready(function () {
  // Recupera token e dati utente dal localStorage
  const token = localStorage.getItem('token');
  const utente = JSON.parse(localStorage.getItem('utente'));

  // Inizializza Stripe se la chiave pubblica è disponibile
  const stripeKey = window.STRIPE_PUBLISHABLE_KEY;
  const stripe = stripeKey ? Stripe(stripeKey) : null;
  let card;

  // Se utente non loggato, reindirizza
  if (!token || !utente) {
    alert("Effettua il login per accedere al pagamento.");
    window.location.href = "index.html";
    return;
  }

  // Se Stripe non disponibile, disabilita pagamento con carta
  if (!stripe) {
    $('#metodo option[value="carta"]').prop('disabled', true)
      .text('💳 Carta di Credito (non disponibile)');
    $('#alertPagamento').html(
      '<div class="alert alert-warning">Il pagamento con carta non è al momento disponibile.</div>'
    );
  }

  let prenotazioni = []; // Array per memorizzare le prenotazioni

  // Mostra riepilogo della prenotazione selezionata
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

  // Calcola l'importo da pagare per una prenotazione
  function calcolaImporto(prenotazione) {
    if (!prenotazione.prezzo_orario || !prenotazione.orario_inizio || !prenotazione.orario_fine) {
      return null;
    }

    // Estrae orario di inizio e fine, calcola le ore e moltiplica per il prezzo orario
    const inizio = prenotazione.orario_inizio.slice(0,5);
    const fine = prenotazione.orario_fine.slice(0,5);
    const [hStart, mStart] = inizio.split(':').map(Number);
    const [hEnd, mEnd] = fine.split(':').map(Number);
    const ore = (hEnd + mEnd/60) - (hStart + mStart/60);
    return parseFloat(prenotazione.prezzo_orario) * ore;
  }

  // Aggiorna interfaccia se non ci sono prenotazioni da pagare
  function aggiornaInterfaccia() {
    if ($('#prenotazione option').length === 0) {
      $('#alertPagamento').html('<div class="alert alert-info">Nessuna prenotazione da pagare.</div>');
      $('#formPagamento').hide();
    }
  }

  if (stripe) {
    const elements = stripe.elements();
    card = elements.create('card');
  }

  $('#metodo').change(function() {
    if ($(this).val() === 'carta' && stripe) {
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

  // Gestione cambio prenotazione
  $('#prenotazione').change(function() {
    const prenotazioneId = parseInt($(this).val());
    const prenotazione = prenotazioni.find(p => p.id === prenotazioneId);
    
    if (prenotazione) {
      mostraRiepilogoPrenotazione(prenotazione);
      const importo = calcolaImporto(prenotazione);
      $('#importoDaPagare').text(
        importo ? `Importo totale da pagare: €${importo.toFixed(2)}` : 'Importo non disponibile'
      );
    }
  });

  // Caricamento prenotazioni
  $.ajax({
    url: `${API_BASE}/prenotazioni/non-pagate`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    success: function(res) {
      prenotazioni = res.prenotazioni || [];
      // DEBUG: Mostra la risposta ricevuta dal backend
      console.log('Risposta prenotazioni non pagate:', res);

      // NON filtrare per !p.pagamento_id, la query backend già restituisce solo quelle non pagate
      if (prenotazioni.length === 0) {
        $('#alertPagamento').html('<div class="alert alert-info">Nessuna prenotazione da pagare.</div>');
        $('#formPagamento').hide();
        return;
      }

      prenotazioni.forEach(p => {
        // DEBUG: Mostra la prenotazione per capire i dati ricevuti
        console.log('Prenotazione:', p);

        // Usa sempre il calcolo con prezzo_orario, orario_inizio, orario_fine
        let importo = null;
        const prezzoOrario = p.prezzo_orario;
        // Prendi solo l'orario (es: "09:00:00") dai campi orario_inizio/fine
        const inizio = p.orario_inizio ? p.orario_inizio.slice(0,5) : '';
        const fine = p.orario_fine ? p.orario_fine.slice(0,5) : '';

        if (prezzoOrario && inizio && fine) {
          // Calcola le ore come differenza tra orario_inizio e orario_fine
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

      $('#prenotazione')
        .change(function () {
          const imp = parseFloat(
            $('#prenotazione option:selected').data('importo')
          );
          if (!isNaN(imp)) {
            $('#importoDaPagare').text(`Importo: €${imp.toFixed(2)}`);
          } else {
            $('#importoDaPagare').text('Importo non disponibile');
          }
        })
        .trigger('change');
    },
    error: function (xhr) {
      // Mostra dettagli dell'errore per debug
      console.error('Errore AJAX:', xhr.status, xhr.responseText);
      $('#alertPagamento').html(`<div class="alert alert-danger">Errore nel recupero delle prenotazioni. (${xhr.status})</div>`);
    }
  });

  // Funzione per caricare e visualizzare lo storico pagamenti
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
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
          <tr>
            <td colspan="5" class="text-center text-danger">
              Errore nel caricamento dello storico pagamenti
            </td>
          </tr>
        `);
      }
    });
  }

  // Carica lo storico all'avvio
  caricaStoricoPagamenti();

  // Gestione submit form pagamento
  $('#formPagamento').submit(async function (e) {
    e.preventDefault();

    // Mostra spinner e disabilita il bottone
    const $submitBtn = $(this).find('button[type="submit"]');
    $submitBtn.prop('disabled', true);
    $('#paymentSpinner').removeClass('d-none');

    const prenotazione_id = parseInt($('#prenotazione').val());
    const metodo = $('#metodo').val();

    try {
      if (metodo === 'carta' && stripe) {
        // Crea il PaymentIntent sul backend
        const initRes = await $.ajax({
          url: `${API_BASE}/pagamenti/pagamento`,
          method: 'POST',
          contentType: 'application/json',
          headers: { Authorization: `Bearer ${token}` },
          data: JSON.stringify({ prenotazione_id, metodo })
        });

        // Conferma il pagamento e gestisce eventuali challenge 3D Secure
        const result = await stripe.confirmCardPayment(initRes.clientSecret, {
          payment_method: {
            card: card
          }
        });

        if (result.error || result.paymentIntent.status !== 'succeeded') {
          $('#card-errors').text(result.error ? result.error.message : 'Pagamento non riuscito');
          return;
        }

        // Registra il pagamento sul backend
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
        $('#prenotazione option:selected').remove();
        $('#formPagamento')[0].reset();
        $('#importoDaPagare').empty();
        if ($('#prenotazione option').length === 0) {
          $('#formPagamento').hide();
        }
        caricaStoricoPagamenti(); // Aggiorna lo storico
      } else {
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
        $('#prenotazione option:selected').remove();
        $('#formPagamento')[0].reset();
        $('#importoDaPagare').empty();
        if ($('#prenotazione option').length === 0) {
          $('#formPagamento').hide();
        }
        caricaStoricoPagamenti(); // Aggiorna lo storico
      }
    } catch (xhr) {
      $('#alertPagamento').html(`
        <div class="alert alert-danger d-flex align-items-center">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          ${xhr.responseJSON?.message || 'Errore durante il pagamento'}
        </div>
      `);
    } finally {
      // Nascondi spinner e riabilita il bottone
      $submitBtn.prop('disabled', false);
      $('#paymentSpinner').addClass('d-none');
    }
  });

  // Logout
  $('#logoutBtn').click(function () {
    localStorage.removeItem('token');
    localStorage.removeItem('utente');
    window.location.href = "index.html";
  });
});
