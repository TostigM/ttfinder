-- Add distance preference and game language to lfp_listings
-- Run in phpMyAdmin on dvqeyxmy_ttfinder

ALTER TABLE lfp_listings
  ADD COLUMN distance_preference TINYINT UNSIGNED NOT NULL DEFAULT 25
    COMMENT 'Max miles GM wants players to travel from (5/10/15/25/50/100)';
  -- language and location_country already added in alter_002
