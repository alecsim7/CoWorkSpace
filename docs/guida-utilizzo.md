# Guida all’utilizzo della piattaforma **CoWorkSpace**

Questa guida spiega come collegarsi alla piattaforma e quali funzionalità sono disponibili per i diversi ruoli utente (cliente, gestore e amministratore).

---

## 1. Accesso

1. **Homepage (`index.html`)**  
   - Mostra i pulsanti **Login** e **Registrati**.  
   - Imposta automaticamente l’URL dell’API tramite il meta‑tag `api-base`:
     - Produzione: `https://d1qgb2todm35gi.cloudfront.net/api`
     - Locale: `http://localhost:3001/api` quando la pagina è aperta da `localhost` o `127.0.0.1`

2. **Registrazione**  
   - Campo **nome**, **email**, **password** (almeno 8 caratteri con maiuscola, numero e simbolo) e **ruolo** (`cliente`, `gestore`, `admin`).  
   - Al termine, reindirizza al form di login.

3. **Login**  
   - Inserisci email e password.  
   - Se corretto, salva il token JWT e i dati utente in `localStorage` e reindirizza:
     - `cliente` → `dashboard.html`
     - `gestore` → `gestore.html`
     - `admin`   → `admin.html`

4. **Logout**  
   - Presente nel menu di tutte le pagine protette.  
   - Rimuove il token dal `localStorage` e torna alla homepage.

---

## 2. Navigazione

La barra di navigazione è generata dinamicamente (`frontend/js/menu.js`) in base al ruolo:

| Ruolo    | Sezioni principali                                      |
|----------|---------------------------------------------------------|
| Cliente  | Dashboard, Sedi, Prenotazioni, Pagamenti, Profilo, Logout |
| Gestore  | Sedi, Profilo, (Gestore), Logout                        |
| Admin    | Sedi, Profilo, (Admin), Logout                          |
| Ospite   | Home (login/registrazione)                              |

---

## 3. Funzionalità per ruolo

### 3.1 Cliente
- **Dashboard**: elenco prenotazioni personali con modifica/elimina.  
- **Sedi**: catalogo sedi, filtri per città/tipo/servizi, visualizzazione spazi e prezzi.  
- **Prenotazioni**: ricerca per data/orario/città, conferma tramite modale.  
- **Pagamenti**: seleziona prenotazioni non saldate e paga con PayPal, SatisPay, carta o bancomat; storico ultimi cinque pagamenti.  
- **Profilo**: aggiorna nome e password (il nome si riflette subito nella navbar).

### 3.2 Gestore
- **Gestore**: aggiungi nuove sedi (nome, città, indirizzo) e spazi (tipo, descrizione, servizi, prezzo orario, capienza, immagine facoltativa).  
- **Riepilogo prenotazioni** per ogni spazio.

### 3.3 Amministratore
- **Admin**: elenco completo utenti e sedi con possibilità di eliminarli.  
- Accessibile solo con ruolo `admin`; in caso contrario si viene reindirizzati.

---

## 4. Comportamento comune
- Tutte le pagine protette controllano la presenza del token JWT nel `localStorage`.  
- Se non autenticato o ruolo errato, l’utente viene reindirizzato a `index.html`.  
- Messaggi di successo o errore sono mostrati con alert Bootstrap.

---

## 5. Utilizzo in locale
- Servire le pagine da `localhost`/`127.0.0.1` così gli script usano `http://localhost:3001/api`.  
- Avviare il backend sulla porta `3001` (vedi `docs/deploy.md` e `docs/api-spec.md`).

---

### Conclusione
La piattaforma **CoWorkSpace** permette di registrarsi, prenotare spazi, gestire sedi e amministrare l’intero coworking. Segui i passaggi descritti per sfruttare tutte le funzionalità disponibili in base al tuo ruolo.

