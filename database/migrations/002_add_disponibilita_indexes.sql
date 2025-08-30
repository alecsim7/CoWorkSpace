-- Add indexes on disponibilita for faster queries
CREATE INDEX IF NOT EXISTS idx_disponibilita_spazio_data ON disponibilita (spazio_id, data);
CREATE INDEX IF NOT EXISTS idx_disponibilita_data_orari ON disponibilita (data, orario_inizio, orario_fine);
