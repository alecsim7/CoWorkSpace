$(document).ready(function () {
  // Carica le opzioni per i filtri (città, tipo, servizi) dal backend
  function caricaOpzioni() {
    $.getJSON('/api/sedi/opzioni', function (data) {
      const cittaList = $('#cittaOptions').empty();
      (data.citta || []).forEach(c => cittaList.append(`<option value="${c}"></option>`));

      const tipoList = $('#tipoOptions').empty();
      (data.tipi || []).forEach(t => tipoList.append(`<option value="${t}"></option>`));

      const serviziList = $('#serviziOptions').empty();
      (data.servizi || []).forEach(s => serviziList.append(`<option value="${s}"></option>`));
    });
  }

  // Carica le sedi dal backend, applicando eventuali filtri selezionati
  function caricaSedi() {
    const citta = $('#filtroCitta').val();
    const tipo = $('#filtroTipo').val();
    const servizio = $('#filtroServizio').val();
    const params = {};
    if (citta) params.citta = citta;
    if (tipo) params.tipo = tipo;
    if (servizio) params.servizio = servizio;
    const query = $.param(params);
    const url = query ? '/api/sedi?' + query : '/api/sedi';

    $.getJSON(url, function (sedi) {
      const container = $('#listaSedi');
      container.empty();
      // Se non ci sono sedi, mostra messaggio informativo
      if (!sedi || sedi.length === 0) {
        container.append('<div class="col-12"><div class="alert alert-info">Nessuna sede trovata.</div></div>');
        return;
      }

      // Per ogni sede, crea una card con pulsante dettagli
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

  // Gestione invio form filtri: aggiorna la lista sedi
  $('#formFiltri').submit(function (e) {
    e.preventDefault();
    caricaSedi();
  });

  // Gestione click su pulsante dettagli: mostra/nasconde dettagli degli spazi della sede
  $('#listaSedi').on('click', '.btnDettagli', function () {
    const btn = $(this);
    const id = btn.data('id');
    const dettagliDiv = btn.siblings('.dettagli-sede');

    if (dettagliDiv.is(':visible')) {
      dettagliDiv.slideUp();
      return;
    }

    // Carica dettagli della sede e mostra gli spazi disponibili
    $.getJSON('/api/sedi/' + id, function (sede) {
      if (!sede || !sede.spazi || sede.spazi.length === 0) {
        dettagliDiv.html('<div class="text-muted">Nessuno spazio disponibile.</div>');
      } else {
        const list = $('<ul class="list-group"></ul>');
        const formatter = new Intl.NumberFormat('it-IT', {
          style: 'currency',
          currency: 'EUR'
        });
        sede.spazi.forEach(sp => {
          const prezzo = parseFloat(sp.prezzo_orario);
          const prezzoFmt = isNaN(prezzo) ? 'N/A' : formatter.format(prezzo);
          const tipo = sp.tipo_spazio || sp.tipo || '';
          list.append(
            `<li class="list-group-item">${sp.nome} – ${tipo} (${prezzoFmt})</li>`
          );
        });
        dettagliDiv.html(list);
      }
      dettagliDiv.slideDown();
    });
  });

  // Carica opzioni e sedi all'avvio della pagina
  caricaOpzioni();
  caricaSedi();
});
