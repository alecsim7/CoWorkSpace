===========================================
🗂️ Progetto: CoWorkSpace - Backend
===========================================

👨‍💻 Studente: Alexandru Boitor
🎓 Corso: Tecnologie Innovative per lo Sviluppo del Web
📁 Modulo: Backend Express.js con PostgreSQL

-------------------------------------------
📌 Requisiti
-------------------------------------------
- Node.js (v18+ consigliato)
- PostgreSQL
- Librerie Node installate:
  - express
  - pg
  - cors
  - bcrypt

-------------------------------------------
⚙️ Installazione e Avvio
-------------------------------------------

1. Clona o scarica il progetto:
   git clone <url> (se repository Git)

2. Posizionati nella cartella:
   cd backend

3. Installa i pacchetti:
   npm install

4. Configura le variabili d'ambiente (nella cartella `backend`):
   cp .env.example .env
   # modifica `.env` con le credenziali del tuo database
   # esempio:
   # DB_USER=postgres
   # DB_PASSWORD=tuapassword
   # DB_HOST=localhost
   # DB_PORT=5432
   # DB_NAME=coworkspace

   Se all'avvio vedi l'errore `DB_USER is missing`,
   assicurati che il file `.env` sia presente in `backend/`
   e contenga tutte le variabili sopra elencate.

5. Avvia PostgreSQL e crea il database:
   psql -U postgres
   CREATE DATABASE coworkspace;

6. Esegui il server:
   node server.js

7. Il backend sarà disponibile su:
   http://localhost:3000

-------------------------------------------
🧩 Struttura del backend
-------------------------------------------

- /controllers: logica delle rotte
- /routes: definizione delle rotte REST
- db.js: configurazione della connessione al database
- server.js: punto di ingresso dell’app Express

-------------------------------------------
📡 Endpoints principali (API RESTful)
-------------------------------------------

🔐 Autenticazione:
- POST   /api/register            → Registrazione utente
- POST   /api/login               → Login utente

👤 Utente:
- GET    /api/utente/:id          → Profilo utente
- GET    /api/prenotazioni        → Prenotazioni utente

🏢 Sedi e spazi:
- GET    /api/sedi                → Elenco sedi
- GET    /api/spazi/:sede_id      → Spazi in una sede
- POST   /api/spazi               → Aggiunta spazio (gestore)
- PUT    /api/spazi/:id           → Modifica spazio
- DELETE /api/spazi/:id           → Elimina spazio

📅 Disponibilità:
- POST   /api/spazi/:id/disponibilita   → Aggiungi disponibilità
- POST   /api/disponibilita/ricerca     → Ricerca spazi disponibili

📆 Prenotazioni:
- POST   /api/prenotazioni              → Crea prenotazione

💳 Pagamento:
- POST   /api/pagamento                 → Simulazione pagamento

🛠️ Admin:
- GET    /api/admin/utenti              → Lista utenti
- DELETE /api/admin/utenti/:id          → Elimina utente
- GET    /api/admin/sedi                → Lista sedi
- DELETE /api/admin/sedi/:id            → Elimina sede

-------------------------------------------
📚 Funzionalità implementate
-------------------------------------------

✔️ Registrazione e login (con hash password)
✔️ Visualizzazione sedi e spazi
✔️ Aggiunta e modifica spazi (gestore)
✔️ Disponibilità temporale spazi
✔️ Prenotazione con controllo conflitti
✔️ Pagamento simulato
✔️ Area admin per gestione utenti/sedi
✔️ Ricerca avanzata disponibilità

-------------------------------------------
📝 Note finali
-------------------------------------------

- Tutti i dati vengono gestiti tramite query SQL con PostgreSQL
- Il progetto è modulare e può essere facilmente esteso
- Test eseguibili con Postman o CURL

