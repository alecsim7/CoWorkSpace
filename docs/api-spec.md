# 📡 Specifica API REST – CoWorkSpace

Questa specifica definisce tutte le API REST utilizzate dalla piattaforma **CoWorkSpace**, per la gestione di utenti, sedi, spazi, prenotazioni e pagamenti.

Tutte le richieste e risposte avvengono in formato `JSON`.
Le rotte che richiedono autenticazione devono includere un token/sessione nel client.

Per una panoramica del modello dati consulta il [diagramma ER](../database/er_coworkspace.png).
## ❗ Gestione degli errori

Gli errori sono restituiti con la seguente struttura:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campo email obbligatorio",
    "details": {}
  }
}
```

Codici comuni:

- `VALIDATION_ERROR` – dati non validi o mancanti (`400 Bad Request`)
- `AUTHENTICATION_ERROR` – token assente o credenziali errate (`401 Unauthorized`)
- `PERMISSION_DENIED` – permessi insufficienti (`403 Forbidden`)
- `NOT_FOUND` – risorsa non esistente (`404 Not Found`)
- `SERVER_ERROR` – errore interno (`500 Internal Server Error`)


---

## 🔐 Autenticazione

| Metodo | Endpoint         | Descrizione                                 |
|--------|------------------|---------------------------------------------|
| POST   | `/api/register`  | Registrazione di un nuovo utente            |
| POST   | `/api/login`     | Login e generazione di token/sessione       |
| GET    | `/api/logout`    | Logout e distruzione sessione               |

**Body POST `/api/register`:**

- `nome`, `email`, `password`, `ruolo` (opzionale)
- La password deve contenere almeno 8 caratteri, includendo una lettera maiuscola, una minuscola e un numero.

**Risposte:**

- `201 Created` utente registrato
- `400 Bad Request` se i dati sono mancanti o se la password non rispetta i requisiti di complessità
- `500 Internal Server Error`

**Errori POST `/api/register`:**
- `400 Bad Request`
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "Email già in uso" } }
  ```
- `500 Internal Server Error`
  ```json
  { "error": { "code": "SERVER_ERROR", "message": "Errore inatteso" } }
  ```

**Errori POST `/api/login`:**
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Credenziali non valide" } }
  ```
- `500 Internal Server Error`
  ```json
  { "error": { "code": "SERVER_ERROR", "message": "Errore inatteso" } }
  ```

**Errori GET `/api/logout`:**
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token non valido" } }
  ```

---

## 👤 Utente – Profilo

| Metodo | Endpoint          | Descrizione                                  |
|--------|-------------------|----------------------------------------------|
| GET    | `/api/utente/me`  | Recupera i dati del profilo dell’utente loggato |
| PUT    | `/api/utente/me`  | Aggiorna i dati del proprio profilo utente   |

**Esempio GET `/api/utente/me`:**

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/utente/me
```

Risposta:

```json
{
  "utente": {
    "id": 1,
    "nome": "Mario Rossi",
    "email": "mario@example.com",
    "ruolo": "utente"
  }
}
```

**Body PUT /api/utente/me:**

- `nome` e/o `password` (almeno uno dei due campi)
- La password deve contenere almeno 8 caratteri, includendo una lettera maiuscola, una minuscola e un numero.
- richiede token di autenticazione nel header `Authorization`

**Risposte:**

- `200 OK` profilo aggiornato
- `400 Bad Request` body mancante o non valido o password non conforme ai requisiti di complessità
- `401 Unauthorized` token assente o non valido
- `500 Internal Server Error`

**Errori GET `/api/utente/me`:**
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token mancante" } }
  ```

**Errori PUT `/api/utente/me`:**
- `400 Bad Request`
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "Nessun campo fornito" } }
  ```
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token non valido" } }
  ```

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

**Errori GET `/api/sedi`:**
- `400 Bad Request`
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "Filtro non valido" } }
  ```
- `500 Internal Server Error`
  ```json
  { "error": { "code": "SERVER_ERROR", "message": "Errore inatteso" } }
  ```

**Errori GET `/api/sedi/:id`:**
- `404 Not Found`
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Sede non trovata" } }
  ```
- `500 Internal Server Error`
  ```json
  { "error": { "code": "SERVER_ERROR", "message": "Errore inatteso" } }
  ```

---

## 🛋️ Spazi

| Metodo | Endpoint                           | Descrizione                                     |
|--------|------------------------------------|-------------------------------------------------|
| GET    | `/api/spazi/:sede_id`              | Visualizza gli spazi all’interno di una sede    |
| GET    | `/api/disponibilita/:spazio_id`    | Visualizza la disponibilità per uno spazio      |
| POST   | `/api/disponibilita`               | Ricerca spazi disponibili per data/orario/città |

**Body POST `/api/disponibilita`:** `data`, `orario_inizio`, `orario_fine`, `citta` (opzionale)

**Esempio richiesta:**
```json
{
  "data": "2025-03-10",
  "orario_inizio": "09:00",
  "orario_fine": "11:00",
  "citta": "Roma"
}
```

**Esempio risposta:**
```json
{
  "risultati": [
    {
      "spazio_id": 1,
      "nome_spazio": "Sala Riunioni",
      "descrizione": "Sala riunioni attrezzata",
      "prezzo_orario": 20,
      "nome_sede": "Sede Centrale",
      "citta": "Roma",
      "posti_liberi": 3
    }
  ]
}
```

**Errori GET `/api/spazi/:sede_id`:**
- `404 Not Found`
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Sede non trovata" } }
  ```
- `500 Internal Server Error`
  ```json
  { "error": { "code": "SERVER_ERROR", "message": "Errore inatteso" } }
  ```

**Errori GET `/api/disponibilita/:spazio_id`:**
- `404 Not Found`
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Spazio non trovato" } }
  ```
- `500 Internal Server Error`
  ```json
  { "error": { "code": "SERVER_ERROR", "message": "Errore inatteso" } }
  ```

**Errori POST `/api/disponibilita`:**
- `400 Bad Request`
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "Parametri non validi" } }
  ```
- `500 Internal Server Error`
  ```json
  { "error": { "code": "SERVER_ERROR", "message": "Errore inatteso" } }
  ```

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

**Errori POST `/api/prenotazioni`:**
- `400 Bad Request`
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "Orario non valido" } }
  ```
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token mancante" } }
  ```
- `403 Forbidden`
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "Accesso negato" } }
  ```

**Errori GET `/api/prenotazioni`:**
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token non valido" } }
  ```

**Errori GET `/api/prenotazioni/non-pagate`:**
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token non valido" } }
  ```

**Errori PUT `/api/prenotazioni/:id`:**
- `400 Bad Request`
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "Orari sovrapposti" } }
  ```
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token mancante" } }
  ```
- `403 Forbidden`
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "Prenotazione di altro utente" } }
  ```
- `404 Not Found`
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Prenotazione non trovata" } }
  ```

**Errori DELETE `/api/prenotazioni/:id`:**
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token non valido" } }
  ```
- `403 Forbidden`
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "Prenotazione di altro utente" } }
  ```
- `404 Not Found`
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Prenotazione non trovata" } }
  ```

---

## 💳 Pagamenti

| Metodo | Endpoint                 | Descrizione                                                         |
|--------|--------------------------|---------------------------------------------------------------------|
| POST   | `/api/pagamenti/pagamento`         | Esegue il pagamento di una prenotazione (`prenotazione_id`, `metodo`, `token` per pagamenti carta) – l'importo è letto dalla prenotazione |
| GET    | `/api/pagamenti/storico` | Restituisce lo storico pagamenti dell'utente (parametro opzionale `limit`, default 5) |

**Query params GET `/api/pagamenti/storico`:**
- `limit` (opzionale): numero massimo di pagamenti restituiti (default 5)

**Errori POST `/api/pagamenti/pagamento`:**
- `400 Bad Request`
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "Metodo di pagamento non supportato" } }
  ```
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token mancante" } }
  ```
- `403 Forbidden`
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "Prenotazione di altro utente" } }
  ```
- `404 Not Found`
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Prenotazione non trovata" } }
  ```

**Errori GET `/api/pagamenti/storico`:**
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token non valido" } }
  ```

---

## 📊 Dashboard Gestore

| Metodo | Endpoint                             | Descrizione                                      |
|--------|--------------------------------------|--------------------------------------------------|
| GET    | `/api/sedi/gestore/:id`              | Visualizza sedi gestite dal gestore loggato      |
| POST   | `/api/spazi`                         | Aggiunge uno spazio a una sede (gestore)         |
| PUT    | `/api/spazi/:id`                     | Modifica uno spazio esistente                    |
| DELETE | `/api/spazi/:id`                     | Elimina uno spazio                               |
| POST   | `/api/disponibilita`                 | Aggiunge disponibilità a uno spazio              |

**Body POST /api/disponibilita:** `spazio_id`, `data`, `orario_inizio`, `orario_fine`

**Errori GET `/api/sedi/gestore/:id`:**
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token mancante" } }
  ```
- `403 Forbidden`
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "Non sei gestore di questa sede" } }
  ```

**Errori POST `/api/spazi`:**
- `400 Bad Request`
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "Dati spazio mancanti" } }
  ```
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token non valido" } }
  ```
- `403 Forbidden`
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "Permessi insufficienti" } }
  ```

**Errori PUT `/api/spazi/:id`:**
- `400 Bad Request`
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "Dati non validi" } }
  ```
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token mancante" } }
  ```
- `403 Forbidden`
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "Spazio di altro gestore" } }
  ```
- `404 Not Found`
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Spazio non trovato" } }
  ```

**Errori DELETE `/api/spazi/:id`:**
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token non valido" } }
  ```
- `403 Forbidden`
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "Spazio di altro gestore" } }
  ```
- `404 Not Found`
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Spazio non trovato" } }
  ```

**Errori POST `/api/disponibilita`:**
- `400 Bad Request`
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "Dati mancanti" } }
  ```
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token non valido" } }
  ```
- `403 Forbidden`
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "Spazio di altro gestore" } }
  ```

**Errori GET `/api/gestore/prenotazioni/:gestore_id`:**
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token mancante" } }
  ```
- `403 Forbidden`
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "Permessi insufficienti" } }
  ```

**Errori GET `/api/riepilogo/:id`:**
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token mancante" } }
  ```
- `403 Forbidden`
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "Accesso negato" } }
  ```
- `404 Not Found`
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Spazio non trovato" } }
  ```

**Errori POST `/api/spazi/:id/disponibilita`:**
- `400 Bad Request`
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "Dati mancanti" } }
  ```
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token non valido" } }
  ```
- `403 Forbidden`
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "Spazio di altro gestore" } }
  ```
- `404 Not Found`
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Spazio non trovato" } }
  ```

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

**Errori GET `/api/admin/utenti`:**
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token mancante" } }
  ```
- `403 Forbidden`
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "Solo l'amministratore può accedere" } }
  ```

**Errori GET `/api/admin/sedi`:**
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token non valido" } }
  ```
- `403 Forbidden`
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "Solo l'amministratore può accedere" } }
  ```

**Errori DELETE `/api/admin/utenti/:id`:**
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token mancante" } }
  ```
- `403 Forbidden`
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "Solo l'amministratore può eliminare utenti" } }
  ```
- `404 Not Found`
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Utente non trovato" } }
  ```

**Errori DELETE `/api/admin/sedi/:id`:**
- `401 Unauthorized`
  ```json
  { "error": { "code": "AUTHENTICATION_ERROR", "message": "Token non valido" } }
  ```
- `403 Forbidden`
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "Solo l'amministratore può eliminare sedi" } }
  ```
- `404 Not Found`
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Sede non trovata" } }
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
