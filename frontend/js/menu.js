$(document).ready(function () {
  const utente = JSON.parse(localStorage.getItem('utente'));
  const menu = $('#menuLinks');
  menu.empty();

  if (!utente) {
    menu.append('<li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>');
    $('#nomeUtente').text('');
    $('#ruoloUtente').text('');
  } else {
    menu.append('<li class="nav-item"><a class="nav-link" href="dashboard.html">Dashboard</a></li>');
    menu.append('<li class="nav-item"><a class="nav-link" href="sedi.html">Sedi</a></li>');

    const ruolo = (utente.ruolo || '').toLowerCase();

    if (ruolo === 'cliente') {
      menu.append('<li class="nav-item"><a class="nav-link" href="prenotazione.html">Prenotazioni</a></li>');
      menu.append('<li class="nav-item"><a class="nav-link" href="pagamento.html">Pagamenti</a></li>');
    }
    if (ruolo === 'gestore') {
      menu.append('<li class="nav-item"><a class="nav-link" href="gestore.html">Gestore</a></li>');
    }
    if (ruolo === 'admin') {
      menu.append('<li class="nav-item"><a class="nav-link" href="admin.html">Admin</a></li>');
    }

    $('#nomeUtente').text(utente.nome || '');
    $('#ruoloUtente').text(utente.ruolo ? `(${utente.ruolo})` : '');

    menu.append('<li class="nav-item"><a class="nav-link" href="#" id="logoutLink">Logout</a></li>');

    $('#logoutLink').click(function (e) {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('utente');
      window.location.href = 'index.html';
    });
  }

  const navbar = $('.navbar');
  if (!navbar.is('#mainNavbar')) {
    navbar.addClass('show');
  }
});
