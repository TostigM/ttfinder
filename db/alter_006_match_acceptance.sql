-- Add mutual match-acceptance flags to connections
-- Separate from the initial connection acceptance (player_accepted / gm_accepted).
-- When BOTH are 1, the backend sets status = 'agreed_to_meet' and reveals photos/names.
-- Run in phpMyAdmin on dvqeyxmy_ttfinder

ALTER TABLE connections
  ADD COLUMN player_match_accepted TINYINT(1) NOT NULL DEFAULT 0
    COMMENT '1 = player clicked Accept Match during chat phase',
  ADD COLUMN gm_match_accepted     TINYINT(1) NOT NULL DEFAULT 0
    COMMENT '1 = GM clicked Accept Match during chat phase';
