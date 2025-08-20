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

Consulta la [specifica API](docs/api-spec.md) e la [documentazione del database](database/README-db.md) per maggiori dettagli sul progetto.

## Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- npm
- [PostgreSQL](https://www.postgresql.org/)
- Modern web browser

### Start PostgreSQL
1. Start the PostgreSQL service.
2. Create the `coworkspace` database and load the schema:
   ```bash
   psql -U postgres -c 'CREATE DATABASE coworkspace;'
   psql -U postgres -d coworkspace -f database/schema.sql
   ```
   Infrastructure scripts such as the initial schema and migrations live in [database/schema.sql](database/schema.sql) and [database/migrations](database/migrations/)
3. Run application-specific migrations:
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
The API will be available at `http://localhost:3000`.

### Frontend
Serve the static frontend:
```bash
npx serve frontend
```
or open `frontend/index.html` directly in the browser.

## AWS Deployment
1. **Build Docker image** for the backend:
   ```bash
   docker build -t coworkspace-backend ./backend
   ```
2. **Deploy** the image to Elastic Beanstalk or an EC2 instance.
3. **Provision PostgreSQL** using Amazon RDS.
4. **Upload the frontend** to an S3 bucket and distribute it with CloudFront.
5. **Store secrets in Parameter Store or Secrets Manager** and reference them from your ECS task definition or EC2 user data using `aws ssm get-parameter`.

## Scaling & Monitoring
- CloudWatch alarms track CPU utilization, database connections and HTTP latency.
- An Auto Scaling group reacts to these alarms to scale out/in.
- See [docs/monitoring.md](docs/monitoring.md) for detailed metrics, dashboards and logging configuration.
