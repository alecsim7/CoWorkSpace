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
  - bcrypt
  - cors
  - dotenv
  - express
  - express-rate-limit
  - jsonwebtoken
  - pg
  - stripe
  - winston

-------------------------------------------
⚙️ Installazione e Avvio
-------------------------------------------

1. Clona o scarica il progetto:
   git clone <url> (se repository Git)

2. Posizionati nella cartella:
   cd backend

3. Installa i pacchetti:
   npm install

4. Configura le variabili d'ambiente:
   cp .env.example .env
   # modifica .env con le credenziali del tuo database

5. Avvia PostgreSQL e crea il database:
   psql -U postgres
   CREATE DATABASE coworkspace;

6. Esegui le migrazioni per creare le tabelle del database:
   npm run migrate

7. Esegui il server:
   node server.js

8. Il backend sarà disponibile su:
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
- GET    /api/utente/me           → Profilo dell'utente autenticato
- GET    /api/prenotazioni        → Prenotazioni utente

Esempio richiesta profilo autenticato:

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/utente/me
```

🏢 Sedi e spazi:
- GET    /api/sedi                → Elenco sedi
- GET    /api/spazi/:sede_id      → Spazi in una sede
- POST   /api/spazi               → Aggiunta spazio (gestore)
- PUT    /api/spazi/:id           → Modifica spazio
- DELETE /api/spazi/:id           → Elimina spazio

📅 Disponibilità:
- POST   /api/disponibilita            → Aggiungi disponibilità
- GET    /api/disponibilita/:spazio_id → Visualizza disponibilità di uno spazio

📆 Prenotazioni:
  - POST   /api/prenotazioni              → Crea prenotazione (l'utente è dedotto dal token, l'importo è calcolato)
  - GET    /api/prenotazioni              → Prenotazioni utente
  - PUT    /api/prenotazioni/:id          → Modifica prenotazione
  - DELETE /api/prenotazioni/:id          → Annulla prenotazione (solo proprietario)

💳 Pagamento:
  - POST   /api/pagamenti/pagamento       → Pagamento prenotazione (`prenotazione_id`, `metodo`; importo letto dalla prenotazione)

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

