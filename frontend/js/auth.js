const API_BASE = window.API_BASE || '/api';

$(function () {
  // Mostra il form di login
  $('#btnShowLogin').click(function () {
    $('.forms-wrapper').show();
    $('#loginSection').show();
    $('#registerSection').hide();
    $('#loginAlert').hide();
    $('#registerAlert').hide();
  });

  // Mostra il form di registrazione
  $('#btnShowRegister').click(function () {
    $('.forms-wrapper').show();
    $('#registerSection').show();
    $('#loginSection').hide();
    $('#loginAlert').hide();
    $('#registerAlert').hide();
  });

  // Gestione login con chiamata AJAX
  $('#loginForm').submit(function (e) {
    e.preventDefault();

    // Recupera email e password dal form
    const email = $('#loginEmail').val().trim();
    const password = $('#loginPassword').val();

    $('#loginAlert').remove();

    // Controllo campi obbligatori
    if (!email || !password) {
      $('#loginForm').prepend('<div id="loginAlert" class="alert alert-warning">Inserisci email e password</div>');
      return;
    }

    // Chiamata AJAX per login
    $.ajax({
      url: `${API_BASE}/login`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email, password }),
      success: function (response) {
        // Salva token e utente nel localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('utente', JSON.stringify(response.utente));

        // Redirect in base al ruolo dell'utente
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
        // Mostra errore in caso di login fallito
        const msg = xhr.responseJSON?.message || 'Errore nel login.';
        $('#loginForm').prepend(`<div id="loginAlert" class="alert alert-danger">${msg}</div>`);
      }
    });
  });

  // Gestione registrazione utente
  $('#registerForm').submit(function (e) {
    e.preventDefault();

    // Recupera dati dal form
    const nome = $('#regNome').val().trim();
    const email = $('#regEmail').val().trim();
    const password = $('#regPassword').val();
    const ruolo = $('#regRuolo').val();

    $('#registerAlert').remove();

    // Controllo campi obbligatori
    if (!nome || !email || !password) {
      $('#registerForm').prepend('<div id="registerAlert" class="alert alert-warning">Compila tutti i campi.</div>');
      return;
    }

    // Controllo complessità password
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      $('#registerForm').prepend('<div id="registerAlert" class="alert alert-warning">La password deve contenere almeno 8 caratteri, una lettera maiuscola, un numero e un simbolo</div>');
      return;
    }

    // Chiamata AJAX per registrazione
    $.ajax({
      url: `${API_BASE}/register`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ nome, email, password, ruolo }),
      success: function () {
        // Mostra messaggio e passa al login
        alert('Registrazione effettuata! Ora effettua il login.');
        $('#registerSection').hide();
        $('#loginSection').show();
      },
      error: function (xhr) {
        // Mostra errore in caso di registrazione fallita
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
      // Utente loggato: mostra navbar e nome
      $('#authButtons').hide();
      $('#mainNavbar').addClass('show');
      $('#nomeUtente').text(utente.nome);
      $('#ruoloUtente').text(utente.ruolo ? `(${utente.ruolo})` : '');
    } else {
      // Utente non loggato: mostra solo pulsanti di autenticazione
      $('#authButtons').show();
      $('#mainNavbar').removeClass('show');
      $('#nomeUtente').text('');
      $('#ruoloUtente').text('');
    }
  }

  // Aggiorna menu all'avvio
  aggiornaMenu();
});
