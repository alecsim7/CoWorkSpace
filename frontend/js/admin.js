$(document).ready(function () {
  const token = localStorage.getItem('token');
  const utente = JSON.parse(localStorage.getItem('utente'));

  if (!token || !utente || utente.ruolo !== 'admin') {
    alert("Accesso negato. Solo admin possono entrare.");
    window.location.href = "index.html";
    return;
  }

  $('#adminNome').text(utente.nome);

  // Carica utenti da backend
  function caricaUtenti() {
    $.ajax({
      url: 'http://localhost:3000/api/admin/utenti',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      success: function (utenti) {
        $('#listaUtenti').empty();
        if (utenti.length === 0) {
          $('#listaUtenti').append('<li class="list-group-item">Nessun utente trovato.</li>');
        } else {
          utenti.forEach(u => {
            $('#listaUtenti').append(`
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>${u.nome}</strong> (${u.email}) - <em>${u.ruolo}</em>
                </div>
                <button class="btn btn-danger btn-sm eliminaUtente" data-id="${u.id}">Elimina</button>
              </li>
            `);
          });
        }
      },
      error: function () {
        alert('Errore nel caricamento degli utenti');
      }
    });
  }

  // Carica sedi da backend
  function caricaSedi() {
    $.ajax({
      url: 'http://localhost:3000/api/admin/sedi',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      success: function (sedi) {
        $('#listaSedi').empty();
        if (sedi.length === 0) {
          $('#listaSedi').append('<li class="list-group-item">Nessuna sede trovata.</li>');
        } else {
          sedi.forEach(s => {
            $('#listaSedi').append(`
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>${s.nome}</strong> - ${s.citta} (${s.indirizzo})
                </div>
                <button class="btn btn-danger btn-sm eliminaSede" data-id="${s.id}">Elimina</button>
              </li>
            `);
          });
        }
      },
      error: function () {
        alert('Errore nel caricamento delle sedi');
      }
    });
  }

  // Evento elimina utente
  $('#listaUtenti').on('click', '.eliminaUtente', function () {
    const id = $(this).data('id');
    if (confirm('Sei sicuro di voler eliminare questo utente?')) {
      $.ajax({
        url: `http://localhost:3000/api/admin/utenti/${id}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        success: function () {
          caricaUtenti();
        },
        error: function () {
          alert('Errore durante l\'eliminazione dell\'utente');
        }
      });
    }
  });

  // Evento elimina sede
  $('#listaSedi').on('click', '.eliminaSede', function () {
    const id = $(this).data('id');
    if (confirm('Sei sicuro di voler eliminare questa sede?')) {
      $.ajax({
        url: `http://localhost:3000/api/admin/sedi/${id}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        success: function () {
          caricaSedi();
        },
        error: function () {
          alert('Errore durante l\'eliminazione della sede');
        }
      });
    }
  });

  // Carica dati all’avvio
  caricaUtenti();
  caricaSedi();

  // Logout
  $('#logoutBtn').click(function () {
    localStorage.removeItem('token');
    localStorage.removeItem('utente');
    window.location.href = "index.html";
  });
});
