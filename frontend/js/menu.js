$(document).ready(function () {
  const utente = JSON.parse(localStorage.getItem('utente'));
  const menu = $('#menuLinks');
  menu.empty();

  if (!utente) {
    menu.append('<li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>');
  } else {
    menu.append('<li class="nav-item"><a class="nav-link" href="dashboard.html">Dashboard</a></li>');

    if (utente.ruolo === 'cliente') {
      menu.append('<li class="nav-item"><a class="nav-link" href="prenotazione.html">Prenotazioni</a></li>');
      menu.append('<li class="nav-item"><a class="nav-link" href="pagamento.html">Pagamenti</a></li>');
    }
    if (utente.ruolo === 'gestore') {
      menu.append('<li class="nav-item"><a class="nav-link" href="gestore.html">Gestore</a></li>');
    }
    if (utente.ruolo === 'admin') {
      menu.append('<li class="nav-item"><a class="nav-link" href="admin.html">Admin</a></li>');
    }

    menu.append('<li class="nav-item"><a class="nav-link" href="#" id="logoutLink">Logout</a></li>');

    $('#logoutLink').click(function (e) {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('utente');
      window.location.href = 'index.html';
    });
  }
});
