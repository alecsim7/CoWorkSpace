-- Utenti
CREATE TABLE utenti (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  ruolo VARCHAR(20) CHECK (ruolo IN ('cliente', 'gestore', 'admin')) NOT NULL
);

-- Sedi
CREATE TABLE sedi (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  citta VARCHAR(100) NOT NULL,
  indirizzo VARCHAR(255) NOT NULL,
  gestore_id INTEGER NOT NULL REFERENCES utenti(id) ON DELETE CASCADE
);

-- Index to speed up searches by city
CREATE INDEX IF NOT EXISTS idx_sedi_citta ON sedi (citta);

-- Spazi
CREATE TABLE spazi (
  id SERIAL PRIMARY KEY,
  sede_id INTEGER NOT NULL REFERENCES sedi(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  descrizione TEXT,
  prezzo_orario NUMERIC(6,2) NOT NULL,
  capienza INTEGER NOT NULL CHECK (capienza > 0),
  tipo_spazio VARCHAR(20) CHECK (tipo_spazio IN ('scrivania', 'ufficio', 'sala')) NOT NULL,
  servizi TEXT,
  image_url TEXT
);

-- Disponibilita
CREATE TABLE disponibilita (
  id SERIAL PRIMARY KEY,
  spazio_id INTEGER NOT NULL REFERENCES spazi(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  orario_inizio TIME NOT NULL,
  orario_fine TIME NOT NULL
);

-- Indexes to improve availability searches
CREATE INDEX IF NOT EXISTS idx_disponibilita_spazio_data ON disponibilita (spazio_id, data);
CREATE INDEX IF NOT EXISTS idx_disponibilita_data_orari ON disponibilita (data, orario_inizio, orario_fine);

-- Prenotazioni
CREATE TABLE prenotazioni (
  id SERIAL PRIMARY KEY,
  utente_id INTEGER NOT NULL REFERENCES utenti(id) ON DELETE CASCADE,
  spazio_id INTEGER NOT NULL REFERENCES spazi(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  orario_inizio TIME NOT NULL,
  orario_fine TIME NOT NULL
);

-- Pagamenti
CREATE TABLE pagamenti (
  id SERIAL PRIMARY KEY,
  prenotazione_id INTEGER NOT NULL REFERENCES prenotazioni(id) ON DELETE CASCADE,
  importo NUMERIC(7,2) NOT NULL,
  metodo VARCHAR(20) NOT NULL CHECK (metodo IN ('paypal','satispay','carta','bancomat')),
  provider_id VARCHAR(255),
  stato VARCHAR(20),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

