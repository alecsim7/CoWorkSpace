-- Utente
CREATE TABLE Utente (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  ruolo VARCHAR(20) CHECK (ruolo IN ('cliente', 'gestore', 'admin')) NOT NULL
);

-- Sede
CREATE TABLE Sede (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  città VARCHAR(100) NOT NULL,
  indirizzo VARCHAR(255) NOT NULL,
  gestore_id INTEGER NOT NULL REFERENCES Utente(id) ON DELETE CASCADE
);

-- Spazio
CREATE TABLE Spazio (
  id SERIAL PRIMARY KEY,
  sede_id INTEGER NOT NULL REFERENCES Sede(id) ON DELETE CASCADE,
  tipo_spazio VARCHAR(20) CHECK (tipo_spazio IN ('scrivania', 'ufficio', 'sala')) NOT NULL,
  servizi TEXT,
  prezzo_ora NUMERIC(6,2) NOT NULL
);

-- Disponibilità
CREATE TABLE Disponibilità (
  id SERIAL PRIMARY KEY,
  spazio_id INTEGER NOT NULL REFERENCES Spazio(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  ora_inizio TIME NOT NULL,
  ora_fine TIME NOT NULL
);

-- Prenotazione
CREATE TABLE Prenotazione (
  id SERIAL PRIMARY KEY,
  utente_id INTEGER NOT NULL REFERENCES Utente(id) ON DELETE CASCADE,
  spazio_id INTEGER NOT NULL REFERENCES Spazio(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  ora_inizio TIME NOT NULL,
  ora_fine TIME NOT NULL
);

-- Pagamento
CREATE TABLE Pagamento (
  id SERIAL PRIMARY KEY,
  prenotazione_id INTEGER NOT NULL REFERENCES Prenotazione(id) ON DELETE CASCADE,
  importo NUMERIC(7,2) NOT NULL,
  esito VARCHAR(10) CHECK (esito IN ('OK', 'KO')) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
