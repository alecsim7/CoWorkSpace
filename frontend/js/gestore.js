$(document).ready(function () {
  // Recupera token e dati utente dal localStorage
  const token = localStorage.getItem('token');
  const utente = JSON.parse(localStorage.getItem('utente'));
  const API_BASE = '/api';

  // Controllo accesso: solo gestore autenticato può accedere
  if (!token || !utente || utente.ruolo !== 'gestore') {
    alert("Accesso non autorizzato. Effettua il login come gestore.");
    window.location.href = "index.html";
    return;
  }

  // Carica le sedi gestite dal gestore
  function caricaSedi() {
    $.ajax({
      url: `${API_BASE}/sedi/gestore/${utente.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      success: function (data) {
        const selezionaSede = $('#selezionaSede');
        selezionaSede.empty().append('<option value="">-- Seleziona una sede --</option>');
        data.forEach(sede => {
          selezionaSede.append(`<option value="${sede.id}">${sede.nome} - ${sede.citta}</option>`);
        });
      },
      error: function () {
        $('#alertGestore').html(`<div class="alert alert-danger">❌ Errore nel caricamento delle sedi.</div>`);
      }
    });
  }

  caricaSedi();

  // Carica gli spazi associati alle sedi del gestore, mostrando anche le immagini
  function caricaSpazi() {
    const container = $('#spaziContainer');

    $.ajax({
      url: `${API_BASE}/sedi/gestore/${utente.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      success: function (sedi) {
        container.empty();

        if (!Array.isArray(sedi) || sedi.length === 0) {
          container.html('<div class="alert alert-info">Nessuna sede disponibile.</div>');
          return;
        }

        // Per ogni sede, carica gli spazi associati
        sedi.forEach(sede => {
          $.ajax({
            url: `${API_BASE}/spazi/${sede.id}`,
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
            success: function (spazi) {
              if (!Array.isArray(spazi) || spazi.length === 0) {
                container.append(`<div class="col-12 alert alert-secondary">Nessuno spazio per ${sede.nome}</div>`);
                return;
              }

              // Mostra ogni spazio come card con immagine e descrizione
              spazi.forEach(spazio => {
                container.append(`
                  <div class="col-md-4">
                    <div class="card h-100 shadow-sm">
                      ${spazio.image_url ? `<img src="${spazio.image_url}" class="spazio-thumb card-img-top" alt="${spazio.nome}" />` : ''}
                      <div class="card-body">
                        <h5 class="card-title">${spazio.nome}</h5>
                        <p class="card-text">${spazio.descrizione || ''}</p>
                      </div>
                    </div>
                  </div>
                `);
              });
            },
            error: function () {
              container.append(`<div class="col-12"><div class="alert alert-danger">Errore nel caricamento degli spazi per ${sede.nome}.</div></div>`);
            }
          });
        });
      },
      error: function () {
        container.html('<div class="alert alert-danger">Errore nel caricamento degli spazi.</div>');
      }
    });
  }

  caricaSpazi();

  // Carica riepilogo prenotazioni aggregato per ogni spazio del gestore
  function caricaRiepilogo() {
    $.ajax({
      url: `${API_BASE}/riepilogo/${utente.id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      success: function (data) {
        const container = $('#riepilogoContainer');
        container.empty();

        if (!data.riepilogo || !Array.isArray(data.riepilogo) || data.riepilogo.length === 0) {
          container.html('<div class="alert alert-info">Nessuna prenotazione registrata nei tuoi spazi.</div>');
          return;
        }

        // Mostra riepilogo per ogni spazio
        data.riepilogo.forEach(r => {
          const count = Number(r.totale_prenotazioni) || 0;
          container.append(`
            <div class="card mb-2">
              <div class="row g-0 align-items-center">
                <div class="col-md-3 text-center p-2">
                  ${r.image_url ? `<img src="${r.image_url}" class="spazio-thumb" alt="${r.nome_spazio || 'Spazio'}" />` : ''}
                </div>
                <div class="col-md-9">
                  <div class="card-body">
                    🏢 <strong>${r.nome_sede || 'N/D'}</strong> – 🪑 ${r.nome_spazio || 'N/D'}<br>
                    📊 Prenotazioni totali: ${count}
                  </div>
                </div>
              </div>
            </div>
          `);
        });
      },
      error: function () {
        $('#riepilogoContainer').html('<div class="alert alert-danger">Errore nel caricamento del riepilogo.</div>');
      }
    });
  }

  caricaRiepilogo();

  // Gestione invio form per aggiungere una nuova sede
  $('#formSede').submit(function (e) {
    e.preventDefault();

    const nome = $('#nomeSede').val();
    const citta = $('#cittaSede').val();
    const indirizzo = $('#indirizzoSede').val();

    $.ajax({
      url: `${API_BASE}/sedi`,
      method: 'POST',
      contentType: 'application/json',
      headers: { Authorization: `Bearer ${token}` },
      data: JSON.stringify({ nome, citta, indirizzo, gestore_id: utente.id }),
      success: function () {
        $('#alertGestore').html(`<div class="alert alert-success">✅ Sede aggiunta con successo!</div>`);
        $('#formSede')[0].reset();
        caricaSedi();
      },
      error: function (xhr) {
        $('#alertGestore').html(`<div class="alert alert-danger">❌ Errore: ${xhr.responseJSON?.message || 'Impossibile aggiungere la sede'}</div>`);
      }
    });
  });

  // Gestione invio form per aggiungere un nuovo spazio
  $('#formSpazio').submit(function (e) {
    e.preventDefault();

    const sede_id = $('#selezionaSede').val();
    const nome = $('#nomeSpazio').val();
    const tipo_spazio = $('#tipoSpazio').val();
    const descrizione = $('#descrizioneSpazio').val();
    const servizi = $('#serviziSpazio').val();
    const serviziStr = Array.isArray(servizi) ? servizi.join(',') : servizi || '';
    const prezzo_orario = parseFloat($('#prezzoOrario').val());
    const capienza = parseInt($('#capienza').val());

    // Validazione campi obbligatori
    if (!sede_id) {
      $('#alertGestore').html(`<div class="alert alert-warning">⚠️ Seleziona una sede prima di aggiungere uno spazio.</div>`);
      return;
    }

    if (isNaN(prezzo_orario) || prezzo_orario < 0) {
      $('#alertGestore').html(`<div class="alert alert-warning">⚠️ Inserisci un prezzo orario valido.</div>`);
      return;
    }

    if (isNaN(capienza) || capienza <= 0) {
      $('#alertGestore').html(`<div class="alert alert-warning">⚠️ Inserisci una capienza valida (numero intero positivo).</div>`);
      return;
    }

    if (!tipo_spazio) {
      $('#alertGestore').html(`<div class="alert alert-warning">⚠️ Seleziona il tipo di spazio (scrivania, ufficio o sala).</div>`);
      return;
    }

    if (!servizi || servizi.length === 0) {
      $('#alertGestore').html(`<div class="alert alert-warning">⚠️ Seleziona almeno un servizio.</div>`);
      return;
    }

    // Invia richiesta per aggiungere lo spazio
    $.ajax({
      url: `${API_BASE}/spazi`,
      method: 'POST',
      contentType: 'application/json',
      headers: { Authorization: `Bearer ${token}` },
      data: JSON.stringify({ sede_id, nome, tipo_spazio, descrizione, servizi: serviziStr, prezzo_orario, capienza }),
      success: function () {
        $('#alertGestore').html(`<div class="alert alert-success">✅ Spazio aggiunto con successo!</div>`);
        $('#formSpazio')[0].reset();
        caricaSpazi();
      },
      error: function (xhr) {
        $('#alertGestore').html(`<div class="alert alert-danger">❌ Errore: ${xhr.responseJSON?.message || 'Impossibile aggiungere lo spazio'}</div>`);
      }
    });
  });

  // Gestione logout: rimuove token e dati utente dal localStorage
  $('#logoutBtn').click(function () {
    localStorage.removeItem('token');
    localStorage.removeItem('utente');
    window.location.href = "index.html";
  });
});
