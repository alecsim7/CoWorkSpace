// Base URL per le chiamate API al backend
// Può essere configurato per ambienti diversi impostando la variabile globale `window.API_BASE`
// (ad esempio tramite un file di configurazione o una variabile d'ambiente)
window.API_BASE = window.API_BASE || 'https://localhost:3443/api';
const API_BASE = window.API_BASE || '/api';

$(document).ready(function () {
  // Recupera il token di autenticazione dal localStorage
  const token = localStorage.getItem('token');

  // Se non autenticato, mostra avviso e reindirizza
  if (!token) {
    $('#authAlert').html('<div class="alert alert-warning">Effettua il login per accedere alla dashboard.</div>');
    setTimeout(() => { window.location.href = "index.html"; }, 2000);
    return;
  }

  // Gestione logout: rimuove token e dati utente dal localStorage
  $('#logoutBtn').click(function () {
    localStorage.removeItem('token');
    localStorage.removeItem('utente');
    window.location.href = "index.html";
  });

  // Mostra spinner di caricamento
  function showSpinner() {
    $('#loadingSpinner').removeClass('d-none');
  }

  // Nasconde spinner di caricamento
  function hideSpinner() {
    $('#loadingSpinner').addClass('d-none');
  }

  // Gestione ricerca disponibilità spazi tramite form
  $('#formRicerca').submit(async function (e) {
    e.preventDefault();

    const data = $('#data').val();
    const orario_inizio = $('#orarioInizio').val();
    const orario_fine = $('#orarioFine').val();
    const citta = $('#citta').val();

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

    showSpinner();

    try {
      const res = await fetch(`${API_BASE}/disponibilita`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ data, orario_inizio, orario_fine, citta })
      });
      // DEBUG: Mostra la risposta grezza e i parametri
      const responseText = await res.text();
      console.log('Risposta grezza disponibilità:', responseText);
      console.log('Parametri ricerca:', { data, orario_inizio, orario_fine, citta });

      let response;
      try {
        response = JSON.parse(responseText);
      } catch (e) {
        $('#prenotazioneAlert').html('<div class="alert alert-danger">Risposta non valida dal server.</div>');
        hideSpinner();
        return;
      }

      // AGGIUNGI DEBUG: Mostra eventuali errori dal backend
      if (response.error) {
        $('#prenotazioneAlert').html(`<div class="alert alert-danger">Errore backend: ${response.error}</div>`);
        hideSpinner();
        return;
      }

      const spazi = response.risultati || [];
      console.log('Spazi disponibili:', spazi);

      // AGGIUNGI DEBUG: Mostra la risposta backend completa
      if (spazi.length === 0) {
        $('#prenotazioneAlert').html(
          `<div class="alert alert-warning">
            Nessuno spazio disponibile per l'orario selezionato.<br>
            <strong>Parametri:</strong> ${JSON.stringify({ data, orario_inizio, orario_fine })}<br>
            <strong>Risposta backend:</strong> <pre>${JSON.stringify(response, null, 2)}</pre>
            <strong>Nota:</strong> La risposta dal backend è vuota.<br>
            <strong>Azioni:</strong> 
            <ul>
              <li>Verifica che nel backend la rotta <code>/api/disponibilita</code> restituisca risultati per questi parametri.</li>
              <li>Controlla che ci siano spazi inseriti nel database e che non siano già prenotati per la fascia oraria/data scelta.</li>
              <li>Prova a cambiare data/orario oppure verifica la logica di disponibilità nel backend.</li>
              <li>Se usi filtri lato backend, assicurati che non siano troppo restrittivi.</li>
            </ul>
          </div>`
        );
        hideSpinner();
        return;
      }

      spazi.forEach(spazio => {
        const prezzo = parseFloat(spazio.prezzo_orario);
        const prezzoFormattato = isNaN(prezzo) ? "N/A" : prezzo.toFixed(2);

        const start = new Date(`1970-01-01T${orario_inizio}:00`);
        const end = new Date(`1970-01-01T${orario_fine}:00`);
        const ore = (end - start) / (1000 * 60 * 60);
        const prezzoTotale = isNaN(prezzo) ? "N/A" : (prezzo * ore).toFixed(2);

        const card = `
          <div class="col-md-4 mb-3">
            <div class="card h-100 shadow-sm">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${spazio.nome_spazio}</h5>
                <p class="card-text flex-grow-1">${spazio.descrizione}</p>
                <div class="card-icons text-primary mb-2">
                  <i class="bi bi-wifi"></i><i class="bi bi-cup-hot"></i><i class="bi bi-people"></i>
                </div>
                <p class="mb-1"><i class="bi bi-geo-alt-fill me-1"></i><strong>Sede:</strong> ${spazio.nome_sede}</p>
                <p class="mb-1"><strong>Città:</strong> ${spazio.citta || ''}</p>
                <p class="mb-1"><strong>Prezzo orario:</strong> €${prezzoFormattato}</p>
                <p class="mb-1"><strong>Posti liberi:</strong> ${spazio.posti_liberi}</p>
                <p><strong>Prezzo totale per la fascia selezionata:</strong> €${prezzoTotale}</p>
                <button class="btn btn-primary btn-lg mt-auto w-100 btnPrenota" data-id="${spazio.spazio_id}" data-nome="${spazio.nome_spazio}">Prenota</button>
              </div>
            </div>
          </div>
        `;
        $('#risultatiSpazi').append(card);
      });

      hideSpinner();

      $('.btnPrenota').click(function () {
        const spazio_id = $(this).data('id');
        const nome_spazio = $(this).data('nome');
        $('#confirmModalBody').text(`Confermi la prenotazione di ${nome_spazio}?`);
        $('#confirmModal').data('spazio', { id: spazio_id, nome: nome_spazio });
        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        modal.show();
      });

    } catch (err) {
      // Mostra dettagli dell'errore in console per debug
      console.error('Errore ricerca disponibilità:', err);
      $('#prenotazioneAlert').html(`<div class="alert alert-danger">Errore durante la ricerca.<br>${err.message || JSON.stringify(err)}</div>`);
      hideSpinner();
    }
  });

  // Gestione conferma prenotazione tramite modale
  $('#confirmPrenota').click(async function () {
    const info = $('#confirmModal').data('spazio');
    if (!info) return;
    const { id: spazio_id, nome: nome_spazio } = info;
    const data = $('#data').val();
    const orario_inizio = $('#orarioInizio').val();
    const orario_fine = $('#orarioFine').val();
    const modalEl = document.getElementById('confirmModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
    showSpinner();
    try {
      const res = await fetch(`${API_BASE}/prenotazioni`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ spazio_id, data, orario_inizio, orario_fine })
      });
      const result = await res.json();
      if (!res.ok) throw result;
      const importo = parseFloat(result.importo ?? result.prenotazione?.importo);
      const msgImporto = isNaN(importo) ? '' : ` Importo: €${importo.toFixed(2)}`;
      const msgPosti = typeof result.posti_liberi === 'number' ? ` Posti liberi rimanenti: ${result.posti_liberi}` : '';
      $('#prenotazioneAlert').html(`<div class="alert alert-success">Prenotazione per <strong>${nome_spazio}</strong> registrata!${msgImporto}${msgPosti}</div>`);
      $('#formRicerca')[0].reset();
      $('#risultatiSpazi').empty();
    } catch (err) {
      $('#prenotazioneAlert').html(`<div class="alert alert-danger">Errore: ${err.message || err.responseJSON?.message || 'Prenotazione fallita'}</div>`);
    } finally {
      hideSpinner();
    }
  });
});
