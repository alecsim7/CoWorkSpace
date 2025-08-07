# 📡 Specifica API REST – CoWorkSpace

Questa specifica definisce tutte le API REST utilizzate dalla piattaforma **CoWorkSpace**, per la gestione di utenti, sedi, spazi, prenotazioni e pagamenti.

Tutte le richieste e risposte avvengono in formato `JSON`.  
Le rotte che richiedono autenticazione devono includere un token/sessione nel client.

---

## 🔐 Autenticazione

| Metodo | Endpoint         | Descrizione                                 |
|--------|------------------|---------------------------------------------|
| POST   | `/api/register`  | Registrazione di un nuovo utente            |
| POST   | `/api/login`     | Login e generazione di token/sessione       |
| GET    | `/api/logout`    | Logout e distruzione sessione               |

---

## 👤 Utente – Profilo

| Metodo | Endpoint          | Descrizione                                  |
|--------|-------------------|----------------------------------------------|
| GET    | `/api/utente/me`  | Recupera i dati del profilo dell’utente loggato |
| PUT    | `/api/utente/me`  | Aggiorna i dati del proprio profilo utente   |

**Body PUT /api/utente/me:**

- `nome` e/o `password` (almeno uno dei due campi)
- richiede token di autenticazione nel header `Authorization`

**Risposte:**

- `200 OK` profilo aggiornato
- `400 Bad Request` body mancante o non valido
- `401 Unauthorized` token assente o non valido
- `500 Internal Server Error`

> La precedente rotta `GET /profilo/:id` è **deprecata**.

---

## 🏢 Sedi

| Metodo | Endpoint           | Descrizione                                                     |
|--------|--------------------|-----------------------------------------------------------------|
| GET    | `/api/sedi`        | Visualizza tutte le sedi disponibili (filtri: `citta`, `tipo`, `servizio`) |
| GET    | `/api/sedi/:id`    | Visualizza i dettagli di una singola sede                       |

Filtri disponibili su `/api/sedi`:
- `citta`: filtra per città della sede
- `tipo`: tipologia di spazio (es. scrivania, ufficio, sala)
- `servizio`: testo da ricercare tra i servizi dello spazio

---

## 🛋️ Spazi

| Metodo | Endpoint                           | Descrizione                                     |
|--------|------------------------------------|-------------------------------------------------|
| GET    | `/api/spazi/:sede_id`              | Visualizza gli spazi all’interno di una sede    |
| GET    | `/api/spazi/:id/disponibilita`     | Visualizza la disponibilità per uno spazio      |

---

## 📅 Prenotazioni

| Metodo | Endpoint                           | Descrizione                                                  |
|--------|------------------------------------|--------------------------------------------------------------|
| POST   | `/api/prenotazioni`                | Crea una nuova prenotazione (calcola e restituisce l'importo) |
| GET    | `/api/prenotazioni`                | Elenca tutte le prenotazioni dell’utente loggato             |
| GET    | `/api/prenotazioni/non-pagate`     | Prenotazioni dell’utente non ancora saldate                  |
| PUT    | `/api/prenotazioni/:id`            | Modifica data e orari di una prenotazione esistente          |
| DELETE | `/api/prenotazioni/:id`            | Annulla una prenotazione dell’utente loggato                 |

**Body POST /api/prenotazioni:** `spazio_id`, `data`, `orario_inizio`, `orario_fine`

**Esempio risposta GET `/api/prenotazioni/non-pagate`:**
```json
{
  "prenotazioni": [
    {
      "id": 12,
      "spazio_id": 3,
      "data": "2025-01-10",
      "orario_inizio": "09:00",
      "orario_fine": "11:00",
      "nome_spazio": "Sala Riunioni",
      "nome_sede": "Sede Centrale",
      "prezzo_orario": 20,
      "importo": null
    }
  ]
}
```

**Body PUT `/api/prenotazioni/:id`:** `data`, `orario_inizio`, `orario_fine`

**Esempio richiesta PUT `/api/prenotazioni/12`:**
```json
{
  "data": "2025-02-15",
  "orario_inizio": "10:00",
  "orario_fine": "12:00"
}
```

**Esempio risposta:**
```json
{
  "message": "Prenotazione aggiornata",
  "prenotazione": {
    "id": 12,
    "spazio_id": 3,
    "data": "2025-02-15",
    "orario_inizio": "10:00",
    "orario_fine": "12:00",
    "utente_id": 5
  }
}
```

> **Nota di sicurezza:** l'ID dell'utente viene dedotto dal token di autenticazione e non va inviato nel body. Qualsiasi `utente_id` manipolato o incluso nella richiesta viene ignorato e la prenotazione sarà sempre associata all'utente autenticato.
> Solo il proprietario può modificare o eliminare la propria prenotazione.

---

## 💳 Pagamenti

| Metodo | Endpoint                 | Descrizione                                                         |
|--------|--------------------------|---------------------------------------------------------------------|
| POST   | `/api/pagamento`         | Esegue il pagamento di una prenotazione (`prenotazione_id`, `metodo`) – l'importo è letto dalla prenotazione |
| GET    | `/api/pagamenti/storico` | Restituisce lo storico pagamenti dell'utente (parametro opzionale `limit`, default 5) |

**Query params GET `/api/pagamenti/storico`:**
- `limit` (opzionale): numero massimo di pagamenti restituiti (default 5)

---

## 📊 Dashboard Gestore

| Metodo | Endpoint                                      | Descrizione                                      |
|--------|-----------------------------------------------|--------------------------------------------------|
| GET    | `/api/sedi/gestore/:id`                       | Visualizza sedi gestite dal gestore loggato      |
| GET    | `/api/gestore/prenotazioni/:gestore_id`       | Prenotazioni ricevute per le proprie sedi        |
| GET    | `/api/riepilogo/:id`                          | Riepilogo prenotazioni per spazio                |
| POST   | `/api/spazi`                                  | Aggiunge uno spazio a una sede (gestore)         |
| PUT    | `/api/spazi/:id`                              | Modifica uno spazio esistente                    |
| DELETE | `/api/spazi/:id`                              | Elimina uno spazio                               |
| POST   | `/api/spazi/:id/disponibilita`                | Aggiunge disponibilità a uno spazio              |

**Esempio risposta GET `/api/gestore/prenotazioni/7`:**
```json
{
  "prenotazioniRicevute": [
    {
      "id": 9,
      "utente_id": 4,
      "spazio_id": 2,
      "data": "2025-01-20",
      "orario_inizio": "14:00",
      "orario_fine": "15:00",
      "nome_utente": "Mario Rossi",
      "nome_spazio": "Ufficio 1"
    }
  ]
}
```

**Esempio risposta GET `/api/riepilogo/7`:**
```json
{
  "riepilogo": [
    {
      "nome_sede": "Sede Centrale",
      "nome_spazio": "Sala Riunioni",
      "image_url": "https://esempio.com/sala.jpg",
      "totale_prenotazioni": 12
    }
  ]
}
```

---

## 🛠️ Funzionalità Amministratore

| Metodo | Endpoint                    | Descrizione                                             |
|--------|-----------------------------|---------------------------------------------------------|
| GET    | `/api/admin/utenti`         | Visualizza tutti gli utenti (admin)                     |
| GET    | `/api/admin/sedi`           | Visualizza tutte le sedi (admin)                        |
| DELETE | `/api/admin/utenti/:id`     | Elimina un utente (admin)                               |
| DELETE | `/api/admin/sedi/:id`       | Elimina una sede con spazi, prenotazioni e pagamenti    |

**Esempio risposta GET `/api/admin/sedi`:**
```json
[
  {
    "id": 1,
    "nome": "Sede Centrale",
    "citta": "Roma",
    "gestore_id": 7
  }
]
```

**Esempio risposta DELETE `/api/admin/sedi/1`:**
```json
{ "message": "Sede eliminata" }
```

---

## ✅ Note Tecniche

- Le chiamate `POST` e `PUT` richiedono body JSON valido
- Le chiamate a rotte sensibili devono essere protette da autenticazione
- I codici di risposta saranno standard:
  - `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`

---

## 📎 Autori e versionamento

- Ultimo aggiornamento: **luglio 2025**
- Autori: *Team CoWorkSpace*
