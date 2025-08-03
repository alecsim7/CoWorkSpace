$(document).ready(function () {
  const token = localStorage.getItem('token');
  const utente = JSON.parse(localStorage.getItem('utente'));

  if (!token || !utente) {
    alert("Effettua il login per accedere al pagamento.");
    window.location.href = "index.html";
    return;
  }

  // Gestione submit form pagamento
  $('#formPagamento').submit(function (e) {
    e.preventDefault();

    const importo = parseFloat($('#importo').val());
    const metodo = $('#metodo').val();

    if (isNaN(importo) || importo <= 0 || !metodo) {
      $('#alertPagamento').html('<div class="alert alert-warning">Inserisci tutti i dati richiesti.</div>');
      return;
    }

    $.ajax({
      url: 'http://localhost:3000/api/pagamento',
      method: 'POST',
      contentType: 'application/json',
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: JSON.stringify({
        utente_id: utente.id,
        importo: importo,
        metodo: metodo
      }),
      success: function (res) {
        $('#alertPagamento').html(`<div class="alert alert-success">✅ ${res.message}</div>`);
        $('#formPagamento')[0].reset();
      },
      error: function (xhr) {
        $('#alertPagamento').html(`<div class="alert alert-danger">❌ ${xhr.responseJSON?.message || 'Errore nel pagamento'}</div>`);
      }
    });
  });

  // Logout
  $('#logoutBtn').click(function () {
    localStorage.removeItem('token');
    localStorage.removeItem('utente');
    window.location.href = "index.html";
  });
});
