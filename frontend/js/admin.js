$(document).ready(function () {
  // Recupera token e dati utente dal localStorage
  const token = localStorage.getItem('token');
  const utente = JSON.parse(localStorage.getItem('utente'));

  // Controllo accesso: solo admin può accedere
  if (!token || !utente || utente.ruolo !== 'admin') {
    alert("Accesso negato. Solo admin possono entrare.");
    window.location.href = "index.html";
    return;
  }

  // Mostra il nome dell'admin nella dashboard
  $('#adminNome').text(utente.nome);

  // Funzione per caricare la lista utenti dal backend
  function caricaUtenti() {
    $.ajax({
      url: `${API_BASE_URL}/api/admin/utenti`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      success: function (utenti) {
        $('#listaUtenti').empty();
        if (utenti.length === 0) {
          $('#listaUtenti').append('<li class="list-group-item">Nessun utente trovato.</li>');
        } else {
          // Per ogni utente, aggiungi un elemento alla lista con pulsante elimina
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

  // Funzione per caricare la lista sedi dal backend
  function caricaSedi() {
    $.ajax({
      url: `${API_BASE_URL}/api/admin/sedi`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      success: function (sedi) {
        $('#listaSedi').empty();
        if (sedi.length === 0) {
          $('#listaSedi').append('<li class="list-group-item">Nessuna sede trovata.</li>');
        } else {
          // Per ogni sede, aggiungi un elemento alla lista con pulsante elimina
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

  // Gestione evento elimina utente
  $('#listaUtenti').on('click', '.eliminaUtente', function () {
    const id = $(this).data('id');
    if (confirm('Sei sicuro di voler eliminare questo utente?')) {
      $.ajax({
        url: `${API_BASE_URL}/api/admin/utenti/${id}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        success: function () {
          caricaUtenti(); // Ricarica la lista dopo eliminazione
        },
        error: function () {
          alert('Errore durante l\'eliminazione dell\'utente');
        }
      });
    }
  });

  // Gestione evento elimina sede
  $('#listaSedi').on('click', '.eliminaSede', function () {
    const id = $(this).data('id');
    if (confirm('Sei sicuro di voler eliminare questa sede?')) {
      $.ajax({
        url: `${API_BASE_URL}/api/admin/sedi/${id}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        success: function () {
          caricaSedi(); // Ricarica la lista dopo eliminazione
        },
        error: function () {
          alert('Errore durante l\'eliminazione della sede');
        }
      });
    }
  });

  // Carica dati all’avvio della pagina
  caricaUtenti();
  caricaSedi();

  // Gestione logout
  $('#logoutBtn').click(function () {
    localStorage.removeItem('token');
    localStorage.removeItem('utente');
    window.location.href = "index.html";
  });
});
