# Script di utilità

Questo script verifica la connessione al database PostgreSQL configurato per il backend.

## Utilizzo

Dal percorso `backend` esegui:

```bash
node scripts/test-db.js
```

Lo script esegue una semplice query `SELECT NOW()` e stampa il risultato per confermare che la connessione sia corretta.
