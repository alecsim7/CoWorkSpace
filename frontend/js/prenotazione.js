$(document).ready(function () {
  const token = localStorage.getItem('token');

  if (!token) {
    alert("Effettua il login per accedere alla dashboard.");
    window.location.href = "index.html";
    return;
  }

  // Logout button
  $('#logoutBtn').click(function () {
    localStorage.removeItem('token');
    localStorage.removeItem('utente');
    window.location.href = "index.html";
  });

  function showSpinner() {
    $('#loadingSpinner').show();
  }

  function hideSpinner() {
    $('#loadingSpinner').hide();
  }

  // Cerca disponibilità spazi
  $('#formRicerca').submit(async function (e) {
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

    showSpinner();

    try {
      const res = await fetch('http://localhost:3000/api/disponibilita', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ data, orario_inizio, orario_fine })
      });
      if (!res.ok) throw new Error();
      const response = await res.json();
      const spazi = response.risultati || [];

      if (spazi.length === 0) {
        $('#prenotazioneAlert').html('<div class="alert alert-warning">Nessuno spazio disponibile per l\'orario selezionato.</div>');
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
              <img src="https://via.placeholder.com/600x400?text=${encodeURIComponent(spazio.nome_spazio)}" class="spazio-img card-img-top" alt="${spazio.nome_spazio}">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${spazio.nome_spazio}</h5>
                <p class="card-text flex-grow-1">${spazio.descrizione}</p>
                <div class="card-icons text-primary mb-2">
                  <i class="bi bi-wifi"></i><i class="bi bi-cup-hot"></i><i class="bi bi-people"></i>
                </div>
                <p class="mb-1"><i class="bi bi-geo-alt-fill me-1"></i><strong>Sede:</strong> ${spazio.nome_sede}</p>
                <p class="mb-1"><strong>Prezzo orario:</strong> €${prezzoFormattato}</p>
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
      $('#prenotazioneAlert').html('<div class="alert alert-danger">Errore durante la ricerca.</div>');
      hideSpinner();
    }
  });

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
      const res = await fetch('http://localhost:3000/api/prenotazioni', {
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
      $('#prenotazioneAlert').html(`<div class="alert alert-success">Prenotazione per <strong>${nome_spazio}</strong> registrata!${msgImporto}</div>`);
      $('#formRicerca')[0].reset();
      $('#risultatiSpazi').empty();
    } catch (err) {
      $('#prenotazioneAlert').html(`<div class="alert alert-danger">Errore: ${err.message || err.responseJSON?.message || 'Prenotazione fallita'}</div>`);
    } finally {
      hideSpinner();
    }
  });
});
