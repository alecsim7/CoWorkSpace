$(document).ready(function () {
  const token = localStorage.getItem('token');
  const utente = JSON.parse(localStorage.getItem('utente') || 'null');

  if (!token || !utente) {
    window.location.href = 'index.html';
    return;
  }

  $('#profiloForm').submit(function (e) {
    e.preventDefault();
    const nome = $('#nuovoNome').val();
    const password = $('#nuovaPassword').val();

    $.ajax({
      url: 'http://localhost:3000/api/utente/me',
      method: 'PUT',
      contentType: 'application/json',
      headers: { Authorization: `Bearer ${token}` },
      data: JSON.stringify({ nome, password }),
      success: function () {
        $('#profiloAlert').html('<div class="alert alert-success">Profilo aggiornato</div>');
        if (nome) {
          utente.nome = nome;
          localStorage.setItem('utente', JSON.stringify(utente));
          $('#nomeUtente').text(nome);
        }
        $('#profiloForm')[0].reset();
      },
      error: function (xhr) {
        $('#profiloAlert').html(`<div class="alert alert-danger">${xhr.responseJSON?.message || 'Errore durante l\'aggiornamento'}</div>`);
      }
    });
  });
});
