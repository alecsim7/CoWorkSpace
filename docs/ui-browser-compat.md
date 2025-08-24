# Compatibilità Browser UI

Questa guida descrive le principali risorse presenti nella cartella `frontend/` e fornisce indicazioni per verificare la compatibilità tra browser e i breakpoint responsivi dell'interfaccia.

## Struttura del frontend

| Pagina / Risorsa        | Descrizione breve |
|------------------------|-------------------|
| `index.html`           | pagina iniziale con form di registrazione e login |
| `dashboard.html`       | riepilogo prenotazioni dell'utente |
| `prenotazione.html`    | flusso di prenotazione di una postazione |
| `pagamento.html`       | modulo di pagamento tramite Stripe |
| `profilo.html`         | gestione dati del profilo utente |
| `admin.html`           | gestione amministrativa delle prenotazioni |
| `gestore.html`         | strumenti per il gestore delle sedi |
| `sedi.html`            | elenco delle sedi disponibili |
| `css/`                 | contiene `style.css` con lo stile generale e media query responsivi |
| `js/`                  | script modulari: `auth.js`, `dashboard.js`, `prenotazione.js`, ecc. |
| `img/`                 | immagini e icone usate dalle pagine |

## Browser supportati

L'interfaccia è testata sui seguenti browser moderni (ultime due versioni):

- **Google Chrome**
- **Mozilla Firefox**
- **Apple Safari**
- **Microsoft Edge**

## Breakpoint responsivi

I layout principali sono ottimizzati per le seguenti larghezze di viewport:

| Breakpoint      | Larghezza (px) | Dispositivi tipici     |
|-----------------|----------------|------------------------|
| `xs` (mobile)   | < 576          | smartphone             |
| `sm`            | ≥ 576          | piccoli tablet         |
| `md`            | ≥ 768          | tablet                 |
| `lg`            | ≥ 992          | laptop / desktop       |
| `xl`            | ≥ 1200         | monitor grandi         |

## Test manuali

1. Servi o apri le pagine statiche del frontend, ad esempio:
   ```bash
   npx serve frontend
   # oppure apri direttamente frontend/index.html
   ```
2. Per ogni browser supportato:
   - apri la pagina e accedi con un account di prova;
   - naviga tra tutte le pagine principali (dashboard, prenotazione, pagamento, profilo, admin/gestore);
   - verifica layout e funzionalità ai breakpoint indicati utilizzando gli strumenti di sviluppo del browser.


Assicurati che le variabili d'ambiente richieste dal backend e dalla chiave `STRIPE_PUBLISHABLE_KEY` siano impostate quando esegui i test.
