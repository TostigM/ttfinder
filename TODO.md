# TTFinder — TODO

## Security (do before going live)
- [ ] Change `dvqeyxmy_claude` DB password and update config.php on server
- [ ] Set a strong random `SESSION_SECRET` in config.php on server
- [ ] Delete or password-protect `test.php` on server
- [ ] Restrict `AGENT.md` from being publicly accessible (add to .htaccess)

## Infrastructure
- [x] Run `db/schema.sql` in phpMyAdmin to create all 13 tables
- [ ] Set up Cloudinary account and add credentials to config.php
- [ ] Set up Pusher account and add credentials to config.php
- [ ] Set up Google Vision API key and add to config.php
- [ ] Set up Google OAuth credentials (Client ID + Secret) and add to config.php
- [ ] Configure SMTP email (SMTP host, user, password) in config.php
- [ ] Migrate URL from tostigames.com/ttfinder → ttfinder.tostigames.com → own domain

## App — Auth
- [ ] Register page (email + password)
- [ ] Login page
- [ ] Logout
- [ ] Email verification on registration
- [ ] Password reset flow (forgot password → email link → reset)
- [ ] Google social login
- [ ] Session handling (remember me, expiry)

## App — User Profiles
- [ ] Profile setup wizard (after registration)
- [ ] Display name preference (first name or initials)
- [ ] Profile photo upload (Cloudinary + Google Vision moderation)
- [ ] LFT profile (create, edit, toggle public/private, generate QR code)
- [ ] LFP listing (create, edit, deactivate — multiple per user)
- [ ] Account settings page

## App — Discovery & Browse
- [ ] Browse LFP listings (public, paginated)
- [ ] Browse LFT profiles (public, paginated)
- [ ] Location-based search (town/city/county/state radius)
- [ ] Filter by TTRPG system
- [ ] Filter by schedule/availability

## App — Connections
- [ ] Player sends join request to LFP listing
- [ ] GM sends invite to LFT profile (public only)
- [ ] Private LFT QR code scan → invite flow
- [ ] Mutual acceptance flow (both parties confirm)
- [ ] Decline / withdraw request
- [ ] Connection status display

## App — Chat
- [ ] In-app chat (unlocks after mutual acceptance)
- [ ] Pusher real-time messaging
- [ ] Message read receipts
- [ ] Agree to Meet confirmation (unlocks location + photo reveal)

## App — Social
- [ ] Favorite a listing or user
- [ ] Block a user
- [ ] Report a user (with reason + details)

## App — Reviews
- [ ] Submit review after completed connection (star rating + text)
- [ ] Cooldown enforcement (24–48 hours after completion)
- [ ] One review per connection enforcement
- [ ] Flag a review as retaliatory
- [ ] Display review score on profiles/listings
- [ ] Positive threshold → boost listing visibility
- [ ] Negative threshold → trigger moderation review

## App — Moderation Dashboard
- [ ] View pending reports queue
- [ ] Review reported user / photo / review
- [ ] Issue warning
- [ ] Ban user (account-level)
- [ ] Unban user
- [ ] Remove inappropriate photo
- [ ] Dismiss report
- [ ] Moderation action log

## App — Navigation & UX
- [ ] Responsive mobile layout (all pages)
- [ ] Logged-in nav (dashboard, messages, profile, logout)
- [ ] Logged-out nav (browse, login, sign up)
- [ ] Loading states and error handling throughout
- [ ] 404 page
- [ ] Empty states (no listings found, no messages, etc.)

## Open Questions (decisions still needed)
- [ ] Review thresholds: how many negatives trigger moderation? How many positives trigger boost?
- [ ] Future monetization model (premium listings, supporter badge, subscription?)
- [ ] Review cooldown length (24h? 48h?)
