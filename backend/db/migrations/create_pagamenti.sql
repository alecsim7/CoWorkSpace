CREATE TABLE IF NOT EXISTS pagamenti (
    id SERIAL PRIMARY KEY,
    prenotazione_id INTEGER REFERENCES prenotazioni(id),
    importo DECIMAL(10,2) NOT NULL,
    metodo VARCHAR(50) NOT NULL,
    provider_id VARCHAR(255),
    stato VARCHAR(20),
    "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
