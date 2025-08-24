# CoWorkSpace

Piattaforma full-stack per la gestione di spazi di coworking. 
Il progetto comprende:

- **Backend** Node.js/Express con PostgreSQL
- **Frontend** statico in HTML/CSS/JS
- **Database** PostgreSQL

Il diagramma ER del database è disponibile [qui](database/er_coworkspace.png).

## Prerequisiti

- [Node.js](https://nodejs.org/) v18+
- npm
- [PostgreSQL](https://www.postgresql.org/)
- Un browser web moderno

## Configurazione delle variabili d'ambiente

Creare un file `backend/.env` con le variabili necessarie:

```bash
PORT=3000
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coworkspace
JWT_SECRET=supersegreto
# Chiave segreta Stripe per i pagamenti
STRIPE_SECRET_KEY=sk_test_...
```

Adatta i valori alle tue impostazioni locali.

Per il frontend è inoltre necessario esporre la chiave pubblicabile Stripe (`STRIPE_PUBLISHABLE_KEY`) come variabile globale `window.STRIPE_PUBLISHABLE_KEY` nelle pagine che effettuano pagamenti.

## Avvio del database

1. Avvia PostgreSQL.
2. Crea il database `coworkspace` e importa lo schema:
   ```bash
   psql -U postgres -c 'CREATE DATABASE coworkspace;'
   psql -U postgres -d coworkspace -f database/schema.sql
   ```
3. Ulteriori dettagli nella documentazione del database: [database/README-db.md](database/README-db.md).

## Avvio del backend

1. Posizionati nella cartella `backend`:
   ```bash
   cd backend
   npm install
   npm start
   ```
2. L'API sarà disponibile su `http://localhost:3000` (o sulla porta configurata).

## Endpoint principali

| Metodo | Endpoint                 | Descrizione                                      |
|--------|--------------------------|--------------------------------------------------|
| POST   | `/api/register`          | Registrazione di un nuovo utente                 |
| POST   | `/api/login`             | Login e generazione di token/sessione            |
| GET    | `/api/utente/me`         | Recupera i dati del profilo dell’utente loggato |
| PUT    | `/api/utente/me`         | Aggiorna i dati del proprio profilo utente       |
| GET    | `/api/sedi`              | Visualizza tutte le sedi disponibili             |
| GET    | `/api/spazi/:sede_id`    | Visualizza gli spazi all’interno di una sede    |
| POST   | `/api/prenotazioni`      | Crea una nuova prenotazione                      |
| GET    | `/api/prenotazioni`      | Elenca le prenotazioni dell’utente loggato       |
| DELETE | `/api/prenotazioni/:id`  | Annulla una prenotazione                         |
| POST   | `/api/pagamento`         | Esegue il pagamento di una prenotazione          |
| GET    | `/api/pagamenti/storico` | Restituisce lo storico pagamenti dell'utente    |

### Requisiti password

- La password deve contenere almeno 8 caratteri, includendo una lettera maiuscola, una minuscola e un numero.

La specifica completa delle API è disponibile in [docs/api-spec.md](docs/api-spec.md).

### Esempio: recupero profilo autenticato

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/utente/me
```

## Avvio del frontend

Le pagine statiche sono nella cartella `frontend`.

- Apri `frontend/index.html` direttamente nel browser, **oppure**
- Servi la cartella con un server statico:
  ```bash
  npx serve frontend
  ```

### Configurazione dell'endpoint API

Lo script `frontend/js/prenotazione.js` usa la variabile globale `API_BASE` per determinare l'URL delle API. Il valore predefinito è `/api`, ma può essere sovrascritto:

- **Variabile d'ambiente:** imposta `API_BASE` prima di servire il frontend (es. `API_BASE=https://example.com/api npx serve frontend`) e fai in modo che il server esponga tale valore come `window.API_BASE`.
- **Script inline:** definisci `window.API_BASE` prima di includere `prenotazione.js`:

  ```html
  <script>
    window.API_BASE = 'https://example.com/api';
  </script>
  <script src="js/prenotazione.js"></script>
  ```

---

Consulta la [specifica API](docs/api-spec.md), la [documentazione del database](database/README-db.md) e la [guida alla compatibilità dei browser](docs/ui-browser-compat.md) per maggiori dettagli sul progetto.

## Esecuzione locale

### Prerequisiti
- [Node.js](https://nodejs.org/) v18+
- npm
- [PostgreSQL](https://www.postgresql.org/)
- Browser web moderno

### Avvio di PostgreSQL
1. Avvia il servizio PostgreSQL.
2. Crea il database `coworkspace` e carica lo schema:
   ```bash
   psql -U postgres -c 'CREATE DATABASE coworkspace;'
   psql -U postgres -d coworkspace -f database/schema.sql
   ```
   Gli script di infrastruttura come lo schema iniziale e le migrazioni si trovano in [database/schema.sql](database/schema.sql) e [database/migrations](database/migrations/)
3. Esegui le migrazioni specifiche dell'applicazione:
   ```bash
   cd backend
   npm run migrate
   cd ..
   ```

### Backend
```bash
cd backend
npm install
npm start
```
L'API sarà disponibile su `http://localhost:3000`.

### Frontend
Servi il frontend statico:
```bash
npx serve frontend
```
oppure apri direttamente `frontend/index.html` nel browser.

## Deploy su AWS
1. **Costruisci l'immagine Docker** per il backend:
   ```bash
   docker build -t coworkspace-backend ./backend
   ```
2. **Distribuisci** l'immagine su Elastic Beanstalk o su una istanza EC2.
3. **Provisiona PostgreSQL** tramite Amazon RDS.
4. **Carica il frontend** su un bucket S3 e distribuiscilo con CloudFront.
5. **Memorizza le chiavi segrete in Parameter Store o Secrets Manager** e referenziale dalla definizione del task ECS o tramite user data EC2 usando `aws ssm get-parameter`.

## Scalabilità e Monitoraggio
- Gli allarmi CloudWatch monitorano l'utilizzo della CPU, le connessioni al database e la latenza HTTP.
- Un Auto Scaling group reagisce a questi allarmi per scalare orizzontalmente/verticalmente.
- Consulta [docs/monitoring.md](docs/monitoring.md) per dettagli su metriche, dashboard e configurazione dei log.

## Modalità di Avvio

### 1. Avvio Locale

**Backend**
```bash
cd backend
npm install
npm start
```
L'API sarà disponibile su `http://localhost:3000` (o sulla porta configurata).

**Frontend**
```bash
npx serve frontend
```
Oppure usa [live-server](https://www.npmjs.com/package/live-server):
```bash
npm install -g live-server
cd frontend
live-server
```
Apri il link mostrato dal terminale (es. `http://127.0.0.1:5500`).

---

### 2. Avvio in Cloud (AWS)

- **Backend:** Deploy dell'immagine Docker su Elastic Beanstalk, ECS o EC2.
- **Database:** Provisiona PostgreSQL tramite Amazon RDS.
- **Frontend:** Carica la cartella `frontend` su un bucket S3 e distribuisci con CloudFront.
- **Secrets:** Usa AWS Parameter Store o Secrets Manager per le variabili sensibili.

---

### 3. Avvio tramite Docker

**Costruisci l'immagine Docker:**
```bash
docker build -t coworkspace-backend ./backend
```

**Avvia il container (usando il file .env o .env.local):**
```bash
docker run -p 3001:3001 --env-file ./backend/.env coworkspace-backend
```
Oppure per sviluppo locale:
```bash
docker run -p 3001:3001 --env-file ./backend/.env.local coworkspace-backend
```

L'API sarà disponibile su `http://localhost:3001`.

### 4. Avvio con Docker Compose

Avvia backend e database in una sola volta:
```bash
docker-compose up
```

Per eseguire in background:
```bash
docker-compose up -d
```

Il backend sarà disponibile su `http://localhost:3000` e PostgreSQL su `localhost:5432`. I dati del database persistono nel volume `db-data`.

---

Consulta le sezioni dedicate per dettagli su [deploy](#deploy-su-aws), [configurazione](#configurazione-delle-variabili-dambiente) e [scalabilità](#scalabilità-e-monitoraggio).
