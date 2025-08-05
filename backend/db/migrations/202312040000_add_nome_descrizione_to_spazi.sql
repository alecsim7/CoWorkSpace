-- Migration: add nome and descrizione columns to spazi
ALTER TABLE IF EXISTS spazi
    ADD COLUMN IF NOT EXISTS nome VARCHAR(100) NOT NULL DEFAULT 'Spazio';

ALTER TABLE IF EXISTS spazi
    ADD COLUMN IF NOT EXISTS descrizione TEXT;

-- Populate existing rows with placeholder names
UPDATE spazi
   SET nome = 'Spazio ' || id
 WHERE nome = 'Spazio';

-- Remove default to require explicit nome on future inserts
ALTER TABLE spazi
    ALTER COLUMN nome DROP DEFAULT;
