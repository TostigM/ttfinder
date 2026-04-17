-- Add game language and country fields to lft_profiles
-- Run in phpMyAdmin on dvqeyxmy_ttfinder

ALTER TABLE lft_profiles
  ADD COLUMN language         VARCHAR(50)  NULL DEFAULT NULL
    COMMENT 'Language the player wants to play in',
  ADD COLUMN location_country VARCHAR(100) NULL DEFAULT NULL
    COMMENT 'Country for international browse filtering';
