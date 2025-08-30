-- Add capienza column to spazi
ALTER TABLE IF EXISTS spazi
    ADD COLUMN capienza INTEGER NOT NULL DEFAULT 1 CHECK (capienza > 0);
