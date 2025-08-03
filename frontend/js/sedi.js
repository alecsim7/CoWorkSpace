$(document).ready(function () {
  function caricaSedi() {
    const citta = $('#filtroCitta').val();
    const tipo = $('#filtroTipo').val();
    const servizio = $('#filtroServizio').val();
    const params = {};
    if (citta) params.citta = citta;
    if (tipo) params.tipo = tipo;
    if (servizio) params.servizio = servizio;
    const query = $.param(params);
    const url = query ? `http://localhost:3000/api/sedi?${query}` : 'http://localhost:3000/api/sedi';

    $.getJSON(url, function (sedi) {
      const container = $('#listaSedi');
      container.empty();
      if (!sedi || sedi.length === 0) {
        container.append('<div class="col-12"><div class="alert alert-info">Nessuna sede trovata.</div></div>');
        return;
      }

      sedi.forEach(s => {
        const card = $(
          `<div class="col-md-4">
            <div class="card h-100 shadow-sm">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${s.nome}</h5>
                <p class="card-text flex-grow-1">
                  ${s.citta || ''}<br>
                  ${s.indirizzo || ''}
                </p>
                <button class="btn btn-outline-primary mt-auto btnDettagli" data-id="${s.id}">Dettagli</button>
                <div class="mt-3 dettagli-sede" style="display:none;"></div>
              </div>
            </div>
          </div>`
        );
        container.append(card);
      });
    });
  }

  $('#formFiltri').submit(function (e) {
    e.preventDefault();
    caricaSedi();
  });

  $('#listaSedi').on('click', '.btnDettagli', function () {
    const btn = $(this);
    const id = btn.data('id');
    const dettagliDiv = btn.siblings('.dettagli-sede');

    if (dettagliDiv.is(':visible')) {
      dettagliDiv.slideUp();
      return;
    }

    $.getJSON(`http://localhost:3000/api/sedi/${id}`, function (sede) {
      if (!sede || !sede.spazi || sede.spazi.length === 0) {
        dettagliDiv.html('<div class="text-muted">Nessuno spazio disponibile.</div>');
      } else {
        const list = $('<ul class="list-group"></ul>');
        sede.spazi.forEach(sp => {
          const prezzo = parseFloat(sp.prezzo_ora);
          const prezzoFmt = isNaN(prezzo) ? 'N/A' : prezzo.toFixed(2);
          list.append(`<li class="list-group-item">${sp.nome} – ${sp.tipo_spazio} (€${prezzoFmt})</li>`);
        });
        dettagliDiv.html(list);
      }
      dettagliDiv.slideDown();
    });
  });

  caricaSedi();
});
