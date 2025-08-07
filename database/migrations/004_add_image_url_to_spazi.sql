-- Add image_url column to spazi for storing image links
ALTER TABLE IF EXISTS spazi
    ADD COLUMN image_url TEXT;
