$(document).ready(function () {
  const token = localStorage.getItem('token');
  const utente = JSON.parse(localStorage.getItem('utente'));

  if (!token || !utente) {
    alert("Effettua il login per accedere alla dashboard.");
    window.location.href = "index.html";
    return;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    return `${h.padStart(2,'0')}:${m.padStart(2,'0')}`;
  }

  // Logout button
  $('#logoutBtn').click(function () {
    localStorage.removeItem('token');
    localStorage.removeItem('utente');
    window.location.href = "index.html";
  });

  // Carica prenotazioni utente (puoi spostare questo in dashboard se vuoi)
  $.ajax({
    url: 'http://localhost:3000/api/prenotazioni',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    success: function (data) {
      const prenotazioni = data.prenotazioni || [];
      if (prenotazioni.length === 0) {
        $('#listaPrenotazioni').append('<li class="list-group-item">Nessuna prenotazione trovata.</li>');
      } else {
        prenotazioni.forEach(p => {
          const dataFormattata = formatDate(p.data);
          const oraInizio = formatTime(p.orario_inizio);
          const oraFine = formatTime(p.orario_fine);
          $('#listaPrenotazioni').append(`
            <li class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start">
              <div>
                📍 <strong>Spazio:</strong> ${p.nome_spazio} <br>
                🗓️ <strong>Data:</strong> ${dataFormattata}
              </div>
              <div class="mt-2 mt-md-0">
                ⏰ <strong>Orario:</strong> ${oraInizio} - ${oraFine}
              </div>
            </li>
          `);
        });
      }
    },
    error: function () {
      $('#listaPrenotazioni').append(`<li class="list-group-item text-danger">Errore nel caricamento.</li>`);
    }
  });

  // Cerca disponibilità spazi
  $('#formRicerca').submit(function (e) {
    e.preventDefault();

    const data = $('#data').val();
    const orario_inizio = $('#orarioInizio').val();
    const orario_fine = $('#orarioFine').val();

    if (!data || !orario_inizio || !orario_fine) {
      $('#prenotazioneAlert').html('<div class="alert alert-warning">Compila tutti i campi</div>');
      return;
    }

    if (orario_fine <= orario_inizio) {
      $('#prenotazioneAlert').html('<div class="alert alert-danger">L\'orario di fine deve essere successivo all\'inizio</div>');
      return;
    }

    $('#prenotazioneAlert').empty();
    $('#risultatiSpazi').empty();

    $.ajax({
      url: 'http://localhost:3000/api/disponibilita',
      method: 'POST',
      contentType: 'application/json',
      headers: { Authorization: `Bearer ${token}` },
      data: JSON.stringify({ data, orario_inizio, orario_fine }),
      success: function (response) {
        const spazi = response.risultati || [];
        if (spazi.length === 0) {
          $('#prenotazioneAlert').html('<div class="alert alert-warning">Nessuno spazio disponibile per l\'orario selezionato.</div>');
          return;
        }

        spazi.forEach(spazio => {
          const prezzo = parseFloat(spazio.prezzo_orario);
          const prezzoFormattato = isNaN(prezzo) ? "N/A" : prezzo.toFixed(2);

          const card = `
            <div class="col-md-4 mb-3">
              <div class="card h-100 shadow-sm">
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title">${spazio.nome_spazio}</h5>
                  <p class="card-text flex-grow-1">${spazio.descrizione}</p>
                  <p class="mb-1"><strong>Sede:</strong> ${spazio.nome_sede}</p>
                  <p><strong>Prezzo orario:</strong> €${prezzoFormattato}</p>
                  <button class="btn btn-success mt-auto btnPrenota" data-id="${spazio.spazio_id}" data-nome="${spazio.nome_spazio}">Prenota</button>
                </div>
              </div>
            </div>
          `;
          $('#risultatiSpazi').append(card);
        });

        // Click su Prenota
        $('.btnPrenota').click(function () {
          const spazio_id = $(this).data('id');
          const nome_spazio = $(this).data('nome');

          $.ajax({
            url: 'http://localhost:3000/api/prenotazioni',
            method: 'POST',
            contentType: 'application/json',
            headers: { Authorization: `Bearer ${token}` },
            data: JSON.stringify({
              utente_id: utente.id,
              spazio_id,
              data,
              orario_inizio,
              orario_fine
            }),
            success: function () {
              $('#prenotazioneAlert').html(`<div class="alert alert-success">✅ Prenotazione per <strong>${nome_spazio}</strong> confermata!</div>`);
              $('#formRicerca')[0].reset();
              $('#risultatiSpazi').empty();
            },
            error: function (xhr) {
              $('#prenotazioneAlert').html(`<div class="alert alert-danger">❌ Errore: ${xhr.responseJSON?.message || 'Prenotazione fallita'}</div>`);
            }
          });
        });
      },
      error: function () {
        $('#prenotazioneAlert').html('<div class="alert alert-danger">Errore durante la ricerca.</div>');
      }
    });
  });
});
