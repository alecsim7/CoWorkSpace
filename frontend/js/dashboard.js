$(document).ready(function () {
  const token = localStorage.getItem('token');
  const utente = JSON.parse(localStorage.getItem('utente') || 'null');

  if (!token || !utente) {
    alert("Effettua il login per accedere alla dashboard.");
    window.location.href = "index.html";
    return;
  }

  $('#logoutBtn').click(function () {
    localStorage.removeItem('token');
    localStorage.removeItem('utente');
    window.location.href = 'index.html';
  });

  if (utente.ruolo === 'cliente') {
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
            const dataFormattata = new Date(p.data).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' });
            const oraInizio = p.orario_inizio ? p.orario_inizio.slice(0, 5) : '';
            const oraFine = p.orario_fine ? p.orario_fine.slice(0, 5) : '';
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
        $('#listaPrenotazioni').append('<li class="list-group-item text-danger">Errore nel caricamento.</li>');
      }
    });
  } else {
    $('#listaPrenotazioni').append('<li class="list-group-item">Nessuna prenotazione da mostrare.</li>');
  }
});
