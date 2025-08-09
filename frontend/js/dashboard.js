$(document).ready(function () {
  const token = localStorage.getItem('token');
  const utente = JSON.parse(localStorage.getItem('utente') || 'null');

  if (!token || !utente || utente.ruolo !== 'cliente') {
    alert('Accesso non autorizzato.');
    window.location.href = 'index.html';
    return;
  }

  $('#logoutBtn').click(function () {
    localStorage.removeItem('token');
    localStorage.removeItem('utente');
    window.location.href = 'index.html';
  });

  function caricaPrenotazioni() {
    $('#listaPrenotazioni').empty();

    console.log('Token inviato:', token); // DEBUG: verifica token

    $.ajax({
      url: `${API_BASE_URL}/api/prenotazioni`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      success: function (data) {
        console.log('Risposta prenotazioni:', data); // DEBUG: verifica cosa arriva dal backend

        // Controllo struttura risposta
        if (!data || !Array.isArray(data.prenotazioni)) {
          $('#listaPrenotazioni').append('<li class="list-group-item text-danger">Risposta inattesa dal server.</li>');
          return;
        }

        const prenotazioni = data.prenotazioni;
        if (prenotazioni.length === 0) {
          $('#listaPrenotazioni').append('<li class="list-group-item">Nessuna prenotazione trovata per il tuo account.</li>');
          return;
        }

        prenotazioni.forEach(p => {
          const dataFormattata = new Date(p.data).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' });
          const oraInizio = p.orario_inizio ? p.orario_inizio.slice(0, 5) : '';
          const oraFine = p.orario_fine ? p.orario_fine.slice(0, 5) : '';
          $('#listaPrenotazioni').append(`
            <li class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start">
              <div>
                📍 <strong>Spazio:</strong> ${p.nome_spazio} <br>
                🗓️ <strong>Data:</strong> ${dataFormattata}
              </div>
              <div class="mt-2 mt-md-0 d-flex flex-column flex-md-row align-items-md-center">
                ⏰ <strong>Orario:</strong> ${oraInizio} - ${oraFine}
                <button class="btn btn-sm btn-warning ms-md-3 mt-2 mt-md-0 btnModifica" data-id="${p.id}" data-data="${p.data}" data-inizio="${p.orario_inizio}" data-fine="${p.orario_fine}">Modifica</button>
                <button class="btn btn-sm btn-danger ms-md-2 mt-2 mt-md-0 btnElimina" data-id="${p.id}">Elimina</button>
              </div>
            </li>
          `);
        });

        $('.btnModifica').click(function () {
          const id = $(this).data('id');
          const dataAttuale = $(this).data('data');
          const inizioAttuale = $(this).data('inizio');
          const fineAttuale = $(this).data('fine');

          const nuovaData = prompt('Nuova data (YYYY-MM-DD)', dataAttuale);
          if (!nuovaData) return;
          const nuovoInizio = prompt('Nuovo orario di inizio (HH:MM)', inizioAttuale);
          if (!nuovoInizio) return;
          const nuovoFine = prompt('Nuovo orario di fine (HH:MM)', fineAttuale);
          if (!nuovoFine) return;

          $.ajax({
            url: `${API_BASE_URL}/api/prenotazioni/${id}`,
            method: 'PUT',
            contentType: 'application/json',
            headers: { Authorization: `Bearer ${token}` },
            data: JSON.stringify({ data: nuovaData, orario_inizio: nuovoInizio, orario_fine: nuovoFine }),
            success: function () {
              $('#dashboardAlert').html('<div class="alert alert-success">Prenotazione aggiornata</div>');
              caricaPrenotazioni();
            },
            error: function (xhr) {
              $('#dashboardAlert').html(`<div class="alert alert-danger">${xhr.responseJSON?.message || 'Errore durante l\'aggiornamento'}</div>`);
            }
          });
        });

        $('.btnElimina').click(function () {
          const id = $(this).data('id');
          if (!confirm('Sei sicuro di voler annullare questa prenotazione?')) return;

          $.ajax({
            url: `${API_BASE_URL}/api/prenotazioni/${id}`,
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
            success: function () {
              $('#dashboardAlert').html('<div class="alert alert-success">Prenotazione eliminata</div>');
              caricaPrenotazioni();
            },
            error: function (xhr) {
              $('#dashboardAlert').html(`<div class="alert alert-danger">${xhr.responseJSON?.message || 'Errore durante l\'eliminazione'}</div>`);
            }
          });
        });
      },
      error: function (xhr) {
        console.error('Errore AJAX:', xhr.status, xhr.responseText); // DEBUG: errore dettagliato
        $('#listaPrenotazioni').append(`<li class="list-group-item text-danger">Errore nel caricamento (${xhr.status}): ${xhr.responseText}</li>`);
      }
    });
  }

  caricaPrenotazioni();
});

