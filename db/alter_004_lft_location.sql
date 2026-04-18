-- Add location fields and distance preference to lft_profiles
-- Run in phpMyAdmin on dvqeyxmy_ttfinder

ALTER TABLE lft_profiles
  ADD COLUMN location_town       VARCHAR(200)     NULL DEFAULT NULL
    COMMENT 'Town / city — shown publicly',
  ADD COLUMN location_state      VARCHAR(100)     NULL DEFAULT NULL
    COMMENT 'State / region — shown publicly',
  -- location_country already added in alter_003
  ADD COLUMN location_lat        DECIMAL(10,7)    NULL DEFAULT NULL
    COMMENT 'Geocoded latitude — server-side only, never returned in API',
  ADD COLUMN location_lng        DECIMAL(10,7)    NULL DEFAULT NULL
    COMMENT 'Geocoded longitude — server-side only, never returned in API',
  ADD COLUMN distance_preference TINYINT UNSIGNED NOT NULL DEFAULT 25
    COMMENT 'Max miles player is willing to travel (5/10/15/25/50/100)';
