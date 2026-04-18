-- TTFinder Database Schema
-- Percona Server 8.0 / MySQL 8.0
-- Charset: utf8mb4_unicode_ci
-- Database: dvqeyxmy_ttfinder
-- Run this in phpMyAdmin: select dvqeyxmy_ttfinder, click SQL tab, paste and run

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- USERS & AUTH
-- ============================================================

CREATE TABLE users (
  id                  INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  email               VARCHAR(255)    NOT NULL UNIQUE,
  password_hash       VARCHAR(255)    NULL,                         -- NULL if social-login only
  display_name        VARCHAR(100)    NOT NULL,
  display_preference  ENUM('first_name','initials') NOT NULL DEFAULT 'first_name',
  ui_language         VARCHAR(10)     NOT NULL DEFAULT 'en',        -- ISO 639-1 code for interface language
  profile_photo_url   VARCHAR(500)    NULL,
  photo_approved      TINYINT(1)      NOT NULL DEFAULT 0,           -- 0 = pending/rejected, 1 = approved
  is_moderator        TINYINT(1)      NOT NULL DEFAULT 0,
  is_banned           TINYINT(1)      NOT NULL DEFAULT 0,
  ban_reason          TEXT            NULL,
  banned_at           TIMESTAMP       NULL,
  created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Social login providers linked to a user account
-- Provider names / IDs are never exposed publicly
CREATE TABLE user_auth_providers (
  id               INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id          INT UNSIGNED  NOT NULL,
  provider         VARCHAR(50)   NOT NULL,           -- e.g. 'google', 'discord'
  provider_user_id VARCHAR(255)  NOT NULL,
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_provider (provider, provider_user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- LOOKING FOR TABLE (LFT) — player seeking a group
-- ============================================================

-- One LFT profile per user; can be public or private
CREATE TABLE lft_profiles (
  id                  INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED     NOT NULL UNIQUE,
  visibility          ENUM('public','private') NOT NULL DEFAULT 'public',
  qr_token            VARCHAR(64)      NULL UNIQUE,        -- generated when set to private; used in QR code URL
  availability        TEXT             NULL,               -- free text: days, times, frequency
  bio                 TEXT             NULL,
  language            VARCHAR(50)      NULL,               -- language the player wants to play in
  location_town       VARCHAR(200)     NULL,               -- shown publicly
  location_state      VARCHAR(100)     NULL,               -- shown publicly
  location_country    VARCHAR(100)     NULL,               -- shown publicly; for browse filtering
  location_lat        DECIMAL(10,7)    NULL,               -- server-side only; NEVER returned in API
  location_lng        DECIMAL(10,7)    NULL,               -- server-side only; NEVER returned in API
  distance_preference TINYINT UNSIGNED NOT NULL DEFAULT 25, -- max miles willing to travel
  is_active           TINYINT(1)       NOT NULL DEFAULT 1,
  created_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- TTRPG systems a player wants to play (many per LFT profile)
CREATE TABLE lft_systems (
  id              INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  lft_profile_id  INT UNSIGNED  NOT NULL,
  system_name     VARCHAR(200)  NOT NULL,
  FOREIGN KEY (lft_profile_id) REFERENCES lft_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- LOOKING FOR PLAYERS (LFP) — GM seeking players
-- ============================================================

-- A user can have multiple LFP listings (one per table they run)
CREATE TABLE lfp_listings (
  id                  INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED    NOT NULL,
  title               VARCHAR(200)    NOT NULL,
  description         TEXT            NULL,
  schedule_day        VARCHAR(100)    NULL,           -- e.g. "Every other Saturday"
  schedule_frequency  VARCHAR(100)    NULL,           -- e.g. "Bi-weekly"
  schedule_time       VARCHAR(100)    NULL,           -- e.g. "6pm–10pm"
  safety_tools        TEXT            NULL,           -- free text
  language            VARCHAR(50)      NULL,               -- language the game is run in
  location_type       VARCHAR(100)     NULL,               -- "game store", "private home", etc.
  location_town       VARCHAR(200)     NULL,               -- display-safe; shown to public
  location_state      VARCHAR(100)     NULL,               -- shown publicly
  location_country    VARCHAR(100)     NULL,               -- shown publicly; for browse filtering
  location_lat        DECIMAL(10,7)    NULL,               -- server-side only; NEVER returned in API
  location_lng        DECIMAL(10,7)    NULL,               -- server-side only; NEVER returned in API
  distance_preference TINYINT UNSIGNED NOT NULL DEFAULT 25, -- max miles for players to travel
  player_slots_total  TINYINT UNSIGNED NULL,
  player_slots_filled TINYINT UNSIGNED NOT NULL DEFAULT 0,
  is_active           TINYINT(1)       NOT NULL DEFAULT 1,
  created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- TTRPG systems played at a table (many per LFP listing)
CREATE TABLE lfp_systems (
  id               INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  lfp_listing_id   INT UNSIGNED  NOT NULL,
  system_name      VARCHAR(200)  NOT NULL,
  FOREIGN KEY (lfp_listing_id) REFERENCES lfp_listings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- CONNECTIONS — the match/acceptance flow
-- ============================================================

-- Tracks the full lifecycle: request → mutual acceptance → chat → agree to meet → completed
CREATE TABLE connections (
  id               INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  player_user_id   INT UNSIGNED  NOT NULL,
  lfp_listing_id   INT UNSIGNED  NOT NULL,
  initiated_by     ENUM('player','gm') NOT NULL,
  status           ENUM(
                     'pending',          -- awaiting the other party's response
                     'accepted',         -- both accepted; chat unlocked
                     'declined',         -- rejected by either party
                     'blocked',          -- one party blocked the other
                     'agreed_to_meet',   -- both confirmed; location/photos revealed
                     'completed'         -- meeting happened; eligible for review
                   ) NOT NULL DEFAULT 'pending',
  player_accepted       TINYINT(1)    NOT NULL DEFAULT 0,  -- initial connection acceptance
  gm_accepted           TINYINT(1)    NOT NULL DEFAULT 0,  -- initial connection acceptance
  player_match_accepted TINYINT(1)    NOT NULL DEFAULT 0,  -- "Accept Match" during chat phase
  gm_match_accepted     TINYINT(1)    NOT NULL DEFAULT 0,  -- "Accept Match" during chat phase
  agreed_to_meet        TINYINT(1)    NOT NULL DEFAULT 0,  -- set when both match flags = 1
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_connection (player_user_id, lfp_listing_id),
  FOREIGN KEY (player_user_id)  REFERENCES users(id)        ON DELETE CASCADE,
  FOREIGN KEY (lfp_listing_id)  REFERENCES lfp_listings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- MESSAGES — in-app chat (unlocked after mutual acceptance)
-- ============================================================

CREATE TABLE messages (
  id               INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  connection_id    INT UNSIGNED  NOT NULL,
  sender_user_id   INT UNSIGNED  NOT NULL,
  content          TEXT          NOT NULL,
  is_read          TINYINT(1)    NOT NULL DEFAULT 0,
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (connection_id)   REFERENCES connections(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_user_id)  REFERENCES users(id)       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- SOCIAL — favorites & blocks
-- ============================================================

CREATE TABLE favorites (
  id           INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED  NOT NULL,
  target_type  ENUM('user','lfp_listing','lft_profile') NOT NULL,
  target_id    INT UNSIGNED  NOT NULL,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_favorite (user_id, target_type, target_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE blocks (
  id               INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  blocker_user_id  INT UNSIGNED  NOT NULL,
  blocked_user_id  INT UNSIGNED  NOT NULL,
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_block (blocker_user_id, blocked_user_id),
  FOREIGN KEY (blocker_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- MODERATION — reports & actions
-- ============================================================

CREATE TABLE reports (
  id                  INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  reporter_user_id    INT UNSIGNED  NOT NULL,
  reported_user_id    INT UNSIGNED  NOT NULL,
  reason              ENUM(
                        'inappropriate_photo',
                        'harassment',
                        'fake_profile',
                        'hate_speech',
                        'spam',
                        'other'
                      ) NOT NULL,
  details             TEXT          NULL,
  status              ENUM(
                        'pending',
                        'under_review',
                        'resolved_warned',
                        'resolved_banned',
                        'resolved_dismissed'
                      ) NOT NULL DEFAULT 'pending',
  moderator_notes     TEXT          NULL,
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_user_id)  REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_user_id)  REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Log of all moderator actions taken (ban, warn, photo removal, etc.)
CREATE TABLE moderation_actions (
  id                  INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  moderator_user_id   INT UNSIGNED  NOT NULL,
  target_user_id      INT UNSIGNED  NOT NULL,
  action_type         ENUM(
                        'warning',
                        'ban',
                        'unban',
                        'photo_removed',
                        'review_removed',
                        'report_dismissed'
                      ) NOT NULL,
  reason              TEXT          NULL,
  related_report_id   INT UNSIGNED  NULL,
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (moderator_user_id)  REFERENCES users(id)    ON DELETE RESTRICT,
  FOREIGN KEY (target_user_id)     REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (related_report_id)  REFERENCES reports(id)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- REVIEWS — post-connection ratings
-- ============================================================

-- Only allowed after connection.status = 'completed'
-- One review per connection per reviewer (enforced by unique key)
-- eligible_after enforces the cooldown period
CREATE TABLE reviews (
  id                  INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  reviewer_user_id    INT UNSIGNED    NOT NULL,
  reviewed_user_id    INT UNSIGNED    NOT NULL,
  connection_id       INT UNSIGNED    NOT NULL,
  rating              TINYINT UNSIGNED NOT NULL,          -- 1–5 stars
  review_text         TEXT            NULL,
  is_flagged          TINYINT(1)      NOT NULL DEFAULT 0, -- flagged as retaliatory
  flag_reason         TEXT            NULL,
  eligible_after      TIMESTAMP       NOT NULL,           -- cannot submit before this time (cooldown)
  created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5),
  UNIQUE KEY uq_review (reviewer_user_id, connection_id),
  FOREIGN KEY (reviewer_user_id)  REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (reviewed_user_id)  REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (connection_id)     REFERENCES connections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


SET FOREIGN_KEY_CHECKS = 1;
