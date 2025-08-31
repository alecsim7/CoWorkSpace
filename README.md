# CoWorkSpace

Piattaforma full-stack per la gestione di spazi di coworking. 
Il progetto comprende:

- **Backend** Node.js/Express con PostgreSQL
- **Frontend** statico in HTML/CSS/JS
- **Database** PostgreSQL


Il diagramma ER del database è disponibile [qui](database/er_coworkspace.png).

## Struttura del progetto

La struttura del repository è organizzata come segue:

```
CoWorkSpace/
├── backend/                # Backend Node.js/Express
│   ├── controllers/        # Logica di business (auth, prenotazioni, pagamenti, ecc.)
│   ├── middleware/         # Middleware (es. autenticazione, validazioni)
│   ├── models/             # Modelli per la gestione del DB
│   ├── routes/             # Definizione delle API REST
│   ├── db/                 # Script e migrazioni del database
│   ├── server.js           # Entry point del backend
│   └── package.json        # Configurazione npm per il backend
│
├── frontend/               # Frontend statico HTML/CSS/JS
│   ├── css/                # Stili CSS
│   ├── js/                 # Script JavaScript (login, prenotazioni, pagamenti, ecc.)
│   ├── index.html          # Homepage
│   ├── dashboard.html      # Dashboard utente
│   ├── gestore.html        # Dashboard gestore
│   ├── admin.html          # Pannello admin
│   └── pagamento.html      # Pagina pagamento
│
├── database/               # Documentazione e schema del DB
│   ├── schema.sql          # Script SQL per creare lo schema
│   ├── er_coworkspace.png  # Diagramma ER del database
│   └── README-db.md        # Documentazione del database
│
├── docs/                   # Documentazione aggiuntiva (API, monitoring, ecc.)
│
├── docker-compose.yml      # Configurazione per avviare servizi in locale
├── README.md               # Documentazione principale del progetto
└── package.json            # Configurazione npm root (se necessaria)
```

## Prerequisiti

- [Node.js](https://nodejs.org/) v18+ e npm
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)
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

## Esecuzione con Docker

1. Costruisci l'immagine del backend:
   ```bash
   docker build -t coworkspace-backend ./backend
   ```
2. Avvia il container usando il file `.env`:
   ```bash
   docker run -p 3001:3001 --env-file ./backend/.env coworkspace-backend
   ```
3. Servi il frontend statico:
   ```bash
   npx serve frontend
   ```
   oppure apri `frontend/index.html` direttamente nel browser.

## Esecuzione manuale con npm

### Avvio del database

1. Avvia PostgreSQL.
2. Crea il database `coworkspace` e importa lo schema:
   ```bash
   psql -U postgres -c 'CREATE DATABASE coworkspace;'
   psql -U postgres -d coworkspace -f database/schema.sql
   ```
3. Esegui le migrazioni:
   ```bash
   cd backend
   npm run migrate
   cd ..
   ```
4. Ulteriori dettagli nella documentazione del database: [database/README-db.md](database/README-db.md).

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

Servi il frontend statico:
```bash
npx serve frontend
```
oppure apri direttamente `frontend/index.html` nel browser.

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

## Deploy su AWS
1. **Costruisci l'immagine Docker** per il backend:
   ```bash
   docker build -t coworkspace-backend ./backend
   ```
2. **Distribuisci** l'immagine su una istanza EC2.
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

- **Backend:** Deploy dell'immagine Docker su EC2.
- **Database:** Provisiona PostgreSQL tramite Amazon RDS.
- **Frontend:** Carica la cartella `frontend` su un bucket S3 e distribuisci con CloudFront.
- **Secrets:** Usa AWS Parameter Store o Secrets Manager per le variabili sensibili.

---

### Deploy automatico su AWS tramite CI/CD

Il progetto è integrato con pipeline CI/CD che automatizzano il deploy su AWS. Ad ogni push su main/master:
- Il backend viene buildato e pubblicato come immagine Docker su Amazon ECR.
- Il database viene migrato automaticamente su Amazon RDS.
- Il frontend viene sincronizzato su S3 e distribuito tramite CloudFront.
- Le variabili sensibili vengono gestite tramite AWS Secrets Manager o Parameter Store.
- Il tutto viene orchestrato tramite i servizi AWS CodePipeline e CodeBuild.

Questo garantisce che ogni modifica venga testata e rilasciata in modo automatico e sicuro sull'infrastruttura AWS.

---

### 3. Avvio tramite Docker Local

**Avvia il container (usando il file .env o .env.local):**
```bash
cd backend
docker build -t coworkspace-backend:local .
docker run --rm --name coworkspace-backend \
  -p 3001:3000 \
  --env-file ./.env \
  coworkspace-backend:local
```
**Comando per chiudere i container Docker:**
```bash
docker stop $(docker ps -q)
```
---

Consulta le sezioni dedicate per dettagli su [deploy](#deploy-su-aws), [configurazione](#configurazione-delle-variabili-dambiente) e [scalabilità](#scalabilità-e-monitoraggio).

