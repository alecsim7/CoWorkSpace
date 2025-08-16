-- Adds index on citta column for frequent searches
CREATE INDEX IF NOT EXISTS idx_sedi_citta ON sedi (citta);
