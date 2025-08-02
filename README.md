# CoWorkSpace

Piattaforma full-stack per la gestione di spazi di coworking. Il progetto comprende:

- **Backend** Node.js/Express con PostgreSQL
- **Frontend** statico in HTML/CSS/JS
- **Database** PostgreSQL

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
```

Adatta i valori alle tue impostazioni locali.

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
   npm start # oppure node server.js
   ```
2. L'API sarà disponibile su `http://localhost:3000` (o sulla porta configurata).

La specifica completa delle API è disponibile in [docs/api-spec.md](docs/api-spec.md).

## Avvio del frontend

Le pagine statiche sono nella cartella `frontend`.

- Apri `frontend/index.html` direttamente nel browser, **oppure**
- Servi la cartella con un server statico:
  ```bash
  npx serve frontend
  ```

---

Consulta la [specifica API](docs/api-spec.md) e la [documentazione del database](database/README-db.md) per maggiori dettagli sul progetto.
