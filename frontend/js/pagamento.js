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

      const prenotazioni = (res.prenotazioni || []).filter(
        p => !p.pagamento_id
      );

      if (prenotazioni.length === 0) {
        $('#alertPagamento').html('<div class="alert alert-info">Nessuna prenotazione da pagare.</div>');
        $('#formPagamento').hide();
        return;
      }

      prenotazioni.forEach(p => {
        // Calcola sempre l'importo usando prezzo_orario, orario_inizio e orario_fine
        let importo = null;
        // Usa i nomi delle proprietà esattamente come arrivano dal backend
        // Debug: mostra la prenotazione per capire i nomi delle proprietà
        console.log('Prenotazione:', p);

        // Supporta sia orario_inizio/orario_fine che ora_inizio/ora_fine
        const inizio = p.orario_inizio || p.ora_inizio;
        const fine = p.orario_fine || p.ora_fine;
        const prezzoOrario = p.prezzo_orario;

        if (prezzoOrario && inizio && fine) {
          const start = new Date(`1970-01-01T${inizio}:00`);
          const end = new Date(`1970-01-01T${fine}:00`);
          const ore = (end - start) / (1000 * 60 * 60);
          importo = parseFloat(prezzoOrario) * ore;
        }

        const testoImporto = (importo !== null && !isNaN(importo))
          ? `€${importo.toFixed(2)}`
          : 'Importo non disponibile';
        const testo = `#${p.id} - ${p.nome_spazio} ${p.data} ${inizio}-${fine} (${testoImporto})`;
        const dataImporto = (importo !== null && !isNaN(importo)) ? importo : '';
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
