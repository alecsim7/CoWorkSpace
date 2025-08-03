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
      // Il backend ritorna solo prenotazioni senza pagamento ma, per
      // maggiore robustezza, filtriamo eventuali casi anomali in cui
      // pagamento_id sia undefined oppure 0.
      const prenotazioni = (res.prenotazioni || []).filter(
        p => !p.pagamento_id
      );

      if (prenotazioni.length === 0) {
        $('#alertPagamento').html('<div class="alert alert-info">Nessuna prenotazione da pagare.</div>');
        $('#formPagamento').hide();
        return;
      }

      prenotazioni.forEach(p => {
        const importo = parseFloat(p.importo);
        const testoImporto = isNaN(importo)
          ? 'Importo non disponibile'
          : `€${importo.toFixed(2)}`;
        const testo = `#${p.id} - ${p.nome_spazio} ${p.data} ${p.ora_inizio}-${p.ora_fine} (${testoImporto})`;
        const dataImporto = isNaN(importo) ? '' : importo;
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
    error: function () {
      $('#alertPagamento').html('<div class="alert alert-danger">Errore nel recupero delle prenotazioni.</div>');
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
