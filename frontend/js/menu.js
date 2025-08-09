$(document).ready(function () {
  // Recupera dati utente dal localStorage
  const utente = JSON.parse(localStorage.getItem('utente'));
  const menu = $('#menuLinks');
  menu.empty();

  // Se utente non loggato, mostra solo Home
  if (!utente) {
    menu.append('<li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>');
    $('#nomeUtente').text('');
    $('#ruoloUtente').text('');
  } else {
    const ruolo = (utente.ruolo || '').toLowerCase();

    // Link specifici per ruolo utente
    if (ruolo === 'cliente') {
      menu.append('<li class="nav-item"><a class="nav-link" href="dashboard.html">Dashboard</a></li>');
      menu.append('<li class="nav-item"><a class="nav-link" href="sedi.html">Sedi</a></li>');
      menu.append('<li class="nav-item"><a class="nav-link" href="prenotazione.html">Prenotazioni</a></li>');
      menu.append('<li class="nav-item"><a class="nav-link" href="pagamento.html">Pagamenti</a></li>');
      menu.append('<li class="nav-item"><a class="nav-link" href="profilo.html">Profilo</a></li>');
    } else {
      // Link comuni per gestore e admin
      menu.append('<li class="nav-item"><a class="nav-link" href="sedi.html">Sedi</a></li>');
      menu.append('<li class="nav-item"><a class="nav-link" href="profilo.html">Profilo</a></li>');
      if (ruolo === 'gestore') {
        menu.append('<li class="nav-item"><a class="nav-link" href="gestore.html">Gestore</a></li>');
      }
      if (ruolo === 'admin') {
        menu.append('<li class="nav-item"><a class="nav-link" href="admin.html">Admin</a></li>');
      }
    }

    // Mostra nome e ruolo utente nella navbar
    $('#nomeUtente').text(utente.nome || '');
    $('#ruoloUtente').text(utente.ruolo ? `(${utente.ruolo})` : '');

    // Aggiungi link logout
    menu.append('<li class="nav-item"><a class="nav-link" href="#" id="logoutLink">Logout</a></li>');

    // Gestione logout: rimuove token e dati utente dal localStorage
    $('#logoutLink').click(function (e) {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('utente');
      window.location.href = 'index.html';
    });
  }

  // Mostra la navbar se non è quella principale
  const navbar = $('.navbar');
  if (!navbar.is('#mainNavbar')) {
    navbar.addClass('show');
  }
});
