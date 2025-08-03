$(document).ready(function () {
  const token = localStorage.getItem('token');
  const utente = JSON.parse(localStorage.getItem('utente'));

  if (!token || !utente) {
    alert("Effettua il login per accedere al pagamento.");
    window.location.href = "index.html";
    return;
  }

  // Carica prenotazioni non ancora pagate
  $.ajax({
    url: 'http://localhost:3000/api/prenotazioni/non-pagate',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    success: function (res) {
      // DEBUG: Mostra la risposta ricevuta dal backend
      console.log('Risposta prenotazioni non pagate:', res);

      const prenotazioni = res.prenotazioni || [];
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

  // Gestione submit form pagamento
  $('#formPagamento').submit(function (e) {
    e.preventDefault();

    const prenotazione_id = parseInt($('#prenotazione').val());
    const metodo = $('#metodo').val();


    $.ajax({
      url: 'http://localhost:3000/api/pagamento',
      method: 'POST',
      contentType: 'application/json',

      headers: { Authorization: `Bearer ${token}` },
      data: JSON.stringify({ prenotazione_id, metodo }),

      success: function (res) {
        $('#alertPagamento').html(`<div class="alert alert-success">✅ ${res.message}</div>`);
        $('#prenotazione option:selected').remove();
        $('#formPagamento')[0].reset();
        $('#importoDaPagare').empty();
        if ($('#prenotazione option').length === 0) {
          $('#formPagamento').hide();
        }
      },
      error: function (xhr) {
        $('#alertPagamento').html(`<div class="alert alert-danger">❌ ${xhr.responseJSON?.message || 'Errore nel pagamento'}</div>`);
      }
    });
  });

  // Logout
  $('#logoutBtn').click(function () {
    localStorage.removeItem('token');
    localStorage.removeItem('utente');
    window.location.href = "index.html";
  });
});
