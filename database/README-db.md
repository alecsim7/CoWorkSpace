# 📦 Database – CoWorkSpace

Questo file documenta la struttura del database relazionale utilizzato per la piattaforma **CoWorkSpace**, progettato per la gestione di sedi, spazi condivisi, prenotazioni e pagamenti.

---

## 🗂️ Modello Entità-Relazione

Il modello ER include le seguenti entità principali:

1. `Utente`
2. `Sede`
3. `Spazio`
4. `Disponibilità`
5. `Prenotazione`
6. `Pagamento`

Le relazioni sono state definite rispettando l'integrità referenziale tramite chiavi esterne.

---

## 🧱 Struttura delle Tabelle

### 🔹 `Utente`

Contiene i dati di login e identificazione di tutti gli utenti della piattaforma.

| Campo     | Tipo         | Descrizione                                  |
|-----------|--------------|----------------------------------------------|
| `id`      | SERIAL       | Identificativo univoco dell'utente           |
| `nome`    | VARCHAR(100) | Nome completo dell'utente                    |
| `email`   | VARCHAR(100) | Email univoca                                |
| `password`| VARCHAR(255) | Password cifrata                             |
| `ruolo`   | VARCHAR(20)  | Tipo di utente: `cliente`, `gestore`, `admin`|

---

### 🔹 `Sede`

Rappresenta una sede fisica dove si trovano gli spazi di coworking.

| Campo         | Tipo         | Descrizione                              |
|---------------|--------------|------------------------------------------|
| `id`          | SERIAL       | Identificativo della sede                |
| `nome`        | VARCHAR(100) | Nome della sede                          |
| `città`       | VARCHAR(100) | Città in cui si trova la sede            |
| `indirizzo`   | VARCHAR(255) | Indirizzo completo                       |
| `gestore_id`  | INTEGER      | FK → `Utente(id)` (solo gestori)         |

---

### 🔹 `Spazio`

Definisce un'unità prenotabile all'interno di una sede (es. sala, scrivania, ufficio).

| Campo         | Tipo         | Descrizione                              |
|---------------|--------------|------------------------------------------|
| `id`          | SERIAL       | Identificativo dello spazio              |
| `sede_id`     | INTEGER      | FK → `Sede(id)`                          |
| `tipo_spazio` | VARCHAR(20)  | Tipo: `scrivania`, `ufficio`, `sala`     |
| `servizi`     | TEXT         | Servizi inclusi (es. WiFi, stampante)    |
| `prezzo_ora`  | NUMERIC(6,2) | Prezzo orario dello spazio               |

---

### 🔹 `Disponibilità`

Contiene le fasce orarie disponibili per ogni spazio.

| Campo        | Tipo   | Descrizione                          |
|--------------|--------|--------------------------------------|
| `id`         | SERIAL | Identificativo della disponibilità   |
| `spazio_id`  | INTEGER| FK → `Spazio(id)`                    |
| `data`       | DATE   | Data della disponibilità             |
| `ora_inizio` | TIME   | Ora di inizio                        |
| `ora_fine`   | TIME   | Ora di fine                          |

---

### 🔹 `Prenotazione`

Rappresenta una prenotazione effettuata da un utente su uno spazio.

| Campo         | Tipo   | Descrizione                          |
|---------------|--------|--------------------------------------|
| `id`          | SERIAL | Identificativo prenotazione          |
| `utente_id`   | INTEGER| FK → `Utente(id)`                    |
| `spazio_id`   | INTEGER| FK → `Spazio(id)`                    |
| `data`        | DATE   | Data della prenotazione              |
| `ora_inizio`  | TIME   | Ora di inizio                        |
| `ora_fine`    | TIME   | Ora di fine                          |

---

### 🔹 `Pagamento`

Dati relativi al pagamento associato a una prenotazione.

| Campo             | Tipo         | Descrizione                          |
|-------------------|--------------|--------------------------------------|
| `id`              | SERIAL       | Identificativo del pagamento         |
| `prenotazione_id` | INTEGER      | FK → `Prenotazione(id)`              |
| `importo`         | NUMERIC(7,2) | Importo totale                       |
| `metodo`          | VARCHAR(20)  | Metodo usato (`paypal`, `satispay`, `carta`, `bancomat`) |
| `timestamp`       | TIMESTAMP    | Data e ora del pagamento             |


---

## 🧭 Relazioni principali

- Ogni `Gestore` (utente) può gestire più `Sedi`
- Ogni `Sede` può contenere più `Spazi`
- Ogni `Spazio` può avere più `Disponibilità` e `Prenotazioni`
- Ogni `Prenotazione` è collegata a un `Utente` e a uno `Spazio`
- Ogni `Prenotazione` ha un solo `Pagamento` associato

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

