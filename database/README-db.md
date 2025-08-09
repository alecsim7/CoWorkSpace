# 📦 Database – CoWorkSpace

Questo file documenta la struttura del database relazionale utilizzato per la piattaforma **CoWorkSpace**, progettato per la gestione di sedi, spazi condivisi, prenotazioni e pagamenti. Per evitare ambiguità, i nomi utilizzati in questa documentazione corrispondono esattamente alle tabelle del database.

---

## 🗂️ Modello Entità-Relazione

Il modello ER include le seguenti entità principali:

1. `utenti`
2. `sedi`
3. `spazi`
4. `disponibilita`
5. `prenotazioni`
6. `pagamenti`

Le relazioni sono state definite rispettando l'integrità referenziale tramite chiavi esterne.

---

## 🧱 Struttura delle Tabelle

### 🔹 `utenti`

Contiene i dati di login e identificazione di tutti gli utenti della piattaforma.

| Campo     | Tipo         | Descrizione                                  |
|-----------|--------------|----------------------------------------------|
| `id`      | SERIAL       | Identificativo univoco dell'utente           |
| `nome`    | VARCHAR(100) | Nome completo dell'utente                    |
| `email`   | VARCHAR(100) | Email univoca                                |
| `password`| VARCHAR(255) | Password cifrata                             |
| `ruolo`   | VARCHAR(20)  | Tipo di utente: `cliente`, `gestore`, `admin`|

---

### 🔹 `sedi`

Rappresenta una sede fisica dove si trovano gli spazi di coworking.

| Campo         | Tipo         | Descrizione                              |
|---------------|--------------|------------------------------------------|
| `id`          | SERIAL       | Identificativo della sede                |
| `nome`        | VARCHAR(100) | Nome della sede                          |
| `città`       | VARCHAR(100) | Città in cui si trova la sede            |
| `indirizzo`   | VARCHAR(255) | Indirizzo completo                       |
| `gestore_id`  | INTEGER      | FK → `utenti(id)` (solo gestori)         |

---

### 🔹 `spazi`

Definisce un'unità prenotabile all'interno di una sede (es. sala, scrivania, ufficio).

| Campo         | Tipo         | Descrizione                              |
|---------------|--------------|------------------------------------------|
| `id`          | SERIAL       | Identificativo dello spazio              |
| `sede_id`     | INTEGER      | FK → `sedi(id)`                          |
| `nome`        | VARCHAR(100) | Nome dello spazio                        |
| `descrizione` | TEXT         | Descrizione dello spazio                 |
| `prezzo_orario`  | NUMERIC(6,2) | Prezzo orario dello spazio               |
| `capienza`    | INTEGER      | Numero massimo di persone                |
| `tipo_spazio` | VARCHAR(20)  | Tipo: `scrivania`, `ufficio`, `sala`     |
| `servizi`     | TEXT         | Servizi inclusi (es. WiFi, stampante)    |
| `image_url`   | TEXT         | URL immagine rappresentativa dello spazio|

---

### 🔹 `disponibilita`

Contiene le fasce orarie disponibili per ogni spazio.

| Campo        | Tipo   | Descrizione                          |
|--------------|--------|--------------------------------------|
| `id`         | SERIAL | Identificativo della disponibilità   |
| `spazio_id`  | INTEGER| FK → `spazi(id)`                    |
| `data`       | DATE   | Data della disponibilità             |
| `orario_inizio` | TIME   | Ora di inizio                        |
| `orario_fine`   | TIME   | Ora di fine                          |

Per migliorare le prestazioni delle query di ricerca sono stati creati i seguenti indici:
- `idx_disponibilita_spazio_data` (`spazio_id`, `data`)
- `idx_disponibilita_data_orari` (`data`, `orario_inizio`, `orario_fine`)

---

### 🔹 `prenotazioni`

Rappresenta una prenotazione effettuata da un utente su uno spazio.

| Campo         | Tipo   | Descrizione                          |
|---------------|--------|--------------------------------------|
| `id`          | SERIAL | Identificativo prenotazione          |
| `utente_id`   | INTEGER| FK → `utenti(id)`                    |
| `spazio_id`   | INTEGER| FK → `spazi(id)`                    |
| `data`        | DATE   | Data della prenotazione              |
| `orario_inizio`  | TIME   | Ora di inizio                        |
| `orario_fine`    | TIME   | Ora di fine                          |

---

### 🔹 `pagamenti`

Raccoglie i dati di pagamento associati a una prenotazione,
inclusi l'identificativo della transazione esterna e lo stato
del pagamento.

| Campo             | Tipo         | Descrizione                          |
|-------------------|--------------|--------------------------------------|
| `id`              | SERIAL       | Identificativo del pagamento         |
| `prenotazione_id` | INTEGER      | FK → `prenotazioni(id)`              |
| `importo`         | NUMERIC(7,2) | Importo totale                       |
| `metodo`          | VARCHAR(20)  | Metodo usato (`paypal`, `satispay`, `carta`, `bancomat`) |
| `provider_id`     | VARCHAR(255) | ID della transazione esterna         |
| `stato`           | VARCHAR(20)  | Stato del pagamento (es. `succeeded`, `pagato`) |
| `timestamp`       | TIMESTAMP    | Data e ora del pagamento             |


---

## 🧭 Relazioni principali

- Ogni `gestore` (utente) può gestire più `sedi`
- Ogni `sede` può contenere più `spazi`
- Ogni `spazio` può avere più `disponibilita` e `prenotazioni`
- Ogni `prenotazione` è collegata a un `utente` e a uno `spazio`
- Ogni `prenotazione` ha un solo `pagamento` associato

---

## 📌 Note

- Le password vengono salvate in formato **hash** (es. con `bcrypt`)
- I valori come `ruolo` e `tipo_spazio` sono validati con `CHECK(...)`
- Le chiavi esterne usano `ON DELETE CASCADE` per mantenere coerenza

---

## 📎 File allegati

- `schema.sql` – Script completo per la creazione del database PostgreSQL
- `er_coworkspace.drawio` – Diagramma ER modificabile (apribile con draw.io)
- `er_coworkspace.png` – Versione immagine del diagramma ER

