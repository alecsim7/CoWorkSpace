$(function () {
  // Mostra form login
  $('#btnShowLogin').click(function () {
    $('.forms-wrapper').show();
    $('#loginSection').show();
    $('#registerSection').hide();
    $('#loginAlert').hide();
    $('#registerAlert').hide();
  });

  // Mostra form registrazione
  $('#btnShowRegister').click(function () {
    $('.forms-wrapper').show();
    $('#registerSection').show();
    $('#loginSection').hide();
    $('#loginAlert').hide();
    $('#registerAlert').hide();
  });

  // Login reale con chiamata AJAX
  $('#loginForm').submit(function (e) {
    e.preventDefault();

    const email = $('#loginEmail').val().trim();
    const password = $('#loginPassword').val();

    $('#loginAlert').remove();

    if (!email || !password) {
      $('#loginForm').prepend('<div id="loginAlert" class="alert alert-warning">Inserisci email e password</div>');
      return;
    }

    $.ajax({
      url: 'http://localhost:3000/api/login', 
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email, password }),
      success: function (response) {
        // Salva token e utente
        localStorage.setItem('token', response.token);
        localStorage.setItem('utente', JSON.stringify(response.utente));

        // Redirect in base al ruolo
        const ruolo = (response.utente.ruolo || '').toLowerCase();
        if (ruolo === 'gestore') {
          window.location.href = 'gestore.html';
        } else if (ruolo === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      },
      error: function (xhr) {
        const msg = xhr.responseJSON?.message || 'Errore nel login.';
        $('#loginForm').prepend(`<div id="loginAlert" class="alert alert-danger">${msg}</div>`);
      }
    });
  });

  // Registrazione (esempio, puoi migliorare)
  $('#registerForm').submit(function (e) {
    e.preventDefault();

    const nome = $('#regNome').val().trim();
    const email = $('#regEmail').val().trim();
    const password = $('#regPassword').val();
    const ruolo = $('#regRuolo').val();

    $('#registerAlert').remove();

    if (!nome || !email || !password) {
      $('#registerForm').prepend('<div id="registerAlert" class="alert alert-warning">Compila tutti i campi.</div>');
      return;
    }

    $.ajax({
      url: 'http://localhost:3000/api/register',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ nome, email, password, ruolo }),
      success: function () {
        alert('Registrazione effettuata! Ora effettua il login.');
        $('#registerSection').hide();
        $('#loginSection').show();
      },
      error: function (xhr) {
        const msg = xhr.responseJSON?.message || 'Errore nella registrazione.';
        $('#registerForm').prepend(`<div id="registerAlert" class="alert alert-danger">${msg}</div>`);
      }
    });
  });

  // Gestione logout globale (da mettere in tutte le pagine protette)
  $('#logoutBtn').click(function () {
    localStorage.removeItem('token');
    localStorage.removeItem('utente');
    window.location.href = "index.html";
  });

  // Mostra/nascondi menu navbar in base a login
  function aggiornaMenu() {
    const utente = JSON.parse(localStorage.getItem('utente'));
    if (utente && utente.nome) {
      $('#authButtons').hide();
      $('#mainNavbar').show();
      $('#nomeUtente').text(utente.nome);
      $('#ruoloUtente').text(utente.ruolo ? `(${utente.ruolo})` : '');
    } else {
      $('#authButtons').show();
      $('#mainNavbar').hide();
      $('#nomeUtente').text('');
      $('#ruoloUtente').text('');
    }
  }

  aggiornaMenu();
});