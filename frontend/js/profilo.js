$(document).ready(function () {
  // Aggiorna il meta tag in locale
  const apiBaseMeta = document.querySelector('meta[name="api-base"]');
  if (
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    && apiBaseMeta
  ) {
    apiBaseMeta.setAttribute('content', 'http://localhost:3001/api');
  }
  const API_BASE_URL = apiBaseMeta ? apiBaseMeta.content.trim() : '/api';

  // Recupera token e dati utente dal localStorage
  const token = localStorage.getItem('token');
  const utente = JSON.parse(localStorage.getItem('utente') || 'null');

  // Se non autenticato, reindirizza alla homepage
  if (!token || !utente) {
    window.location.href = 'index.html';
    return;
  }

  // Gestione invio form per aggiornare il profilo utente
  $('#profiloForm').submit(function (e) {
    e.preventDefault();
    const nome = $('#nuovoNome').val();
    const password = $('#nuovaPassword').val();

    // Chiamata AJAX per aggiornare il profilo
    $.ajax({
      url: `${API_BASE_URL}/utente/me`, // <-- togli /api
      method: 'PUT',
      contentType: 'application/json',
      headers: { Authorization: `Bearer ${token}` },
      data: JSON.stringify({ nome, password }),
      success: function () {
        // Mostra messaggio di successo e aggiorna nome utente in localStorage e navbar
        $('#profiloAlert').html('<div class="alert alert-success">Profilo aggiornato</div>');
        if (nome) {
          utente.nome = nome;
          localStorage.setItem('utente', JSON.stringify(utente));
          $('#nomeUtente').text(nome);
        }
        $('#profiloForm')[0].reset();
      },
      error: function (xhr) {
        // Mostra messaggio di errore in caso di fallimento
        $('#profiloAlert').html(`<div class="alert alert-danger">${xhr.responseJSON?.message || 'Errore durante l\'aggiornamento'}</div>`);
      }
    });
  });
});
