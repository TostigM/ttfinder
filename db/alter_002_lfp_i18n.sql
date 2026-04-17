-- Add game language and country fields to lfp_listings
-- Run in phpMyAdmin on dvqeyxmy_ttfinder

ALTER TABLE lfp_listings
  ADD COLUMN language         VARCHAR(50)  NULL DEFAULT NULL
    COMMENT 'Language the game is run in (e.g. English, Français)',
  ADD COLUMN location_country VARCHAR(100) NULL DEFAULT NULL
    COMMENT 'Country for international browse filtering';
