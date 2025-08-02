$(document).ready(function () {
  // Recupera utente da localStorage
  const utenteRaw = localStorage.getItem('utente');
  let utente = null;

  try {
    utente = JSON.parse(utenteRaw);
  } catch (e) {
    console.error('Errore parsing utente da localStorage:', e);
  }

  if (!utente || !utente.nome || !utente.ruolo) {
    // Se dati utente non corretti, reindirizza al login
    window.location.href = 'index.html';
    return;
  }

  // Mostra nome e ruolo nella navbar
  $('#nomeUtente').text(utente.nome);
  $('#ruoloUtente').text(`(${utente.ruolo})`);

  // Gestione logout
  $('#logoutBtn').click(function () {
    localStorage.removeItem('token');
    localStorage.removeItem('utente');
    window.location.href = 'index.html';
  });

  // TODO: aggiungi qui il caricamento dinamico delle prenotazioni (se vuoi)
});