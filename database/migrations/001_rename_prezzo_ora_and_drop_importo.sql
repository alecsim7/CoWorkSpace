-- Migration: rename prezzo_ora to prezzo_orario and drop importo from prenotazioni
ALTER TABLE IF EXISTS spazi
    RENAME COLUMN prezzo_ora TO prezzo_orario;

ALTER TABLE IF EXISTS prenotazioni
    DROP COLUMN IF EXISTS importo;
