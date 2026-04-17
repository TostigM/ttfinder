-- Add UI language preference to users table
-- Run in phpMyAdmin on dvqeyxmy_ttfinder

ALTER TABLE users
  ADD COLUMN ui_language VARCHAR(10) NOT NULL DEFAULT 'en'
    COMMENT 'ISO 639-1 code for the user''s preferred interface language';
