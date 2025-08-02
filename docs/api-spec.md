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

---

## 🏢 Sedi

| Metodo | Endpoint           | Descrizione                                                     |
|--------|--------------------|-----------------------------------------------------------------|
| GET    | `/api/sedi`        | Visualizza tutte le sedi disponibili (con filtri opzionali)     |
| GET    | `/api/sedi/:id`    | Visualizza i dettagli di una singola sede                       |

---

## 🛋️ Spazi

| Metodo | Endpoint                           | Descrizione                                     |
|--------|------------------------------------|-------------------------------------------------|
| GET    | `/api/spazi/:sede_id`              | Visualizza gli spazi all’interno di una sede    |
| GET    | `/api/spazi/:id/disponibilita`     | Visualizza la disponibilità per uno spazio      |

---

## 📅 Prenotazioni

| Metodo | Endpoint               | Descrizione                                      |
|--------|------------------------|--------------------------------------------------|
| POST   | `/api/prenotazioni`    | Crea una nuova prenotazione                      |
| GET    | `/api/prenotazioni`    | Elenca tutte le prenotazioni dell’utente loggato|
| DELETE | `/api/prenotazioni/:id`| Annulla una prenotazione                         |

---

## 💳 Pagamenti

| Metodo | Endpoint            | Descrizione                            |
|--------|---------------------|----------------------------------------|
| POST   | `/api/pagamenti`    | Simula il pagamento di una prenotazione|

---

## 📊 Dashboard Gestore

| Metodo | Endpoint                             | Descrizione                                      |
|--------|--------------------------------------|--------------------------------------------------|
| GET    | `/api/dashboard/sedi`                | Visualizza sedi gestite dal gestore loggato      |
| POST   | `/api/spazi`                         | Aggiunge uno spazio a una sede (gestore)         |
| PUT    | `/api/spazi/:id`                     | Modifica uno spazio esistente                    |
| DELETE | `/api/spazi/:id`                     | Elimina uno spazio                               |
| POST   | `/api/spazi/:id/disponibilita`       | Aggiunge disponibilità a uno spazio              |

---

## 🛠️ Funzionalità Amministratore

| Metodo | Endpoint                    | Descrizione                             |
|--------|-----------------------------|-----------------------------------------|
| GET    | `/api/admin/utenti`         | Visualizza tutti gli utenti (admin)     |
| DELETE | `/api/admin/utenti/:id`     | Elimina un utente (admin)               |

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
