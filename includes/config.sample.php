<?php
// TTFinder — Configuration template
// Copy this file to config.php and fill in your values.
// config.php is gitignored. NEVER commit real credentials.

define('DB_HOST',     'localhost');
define('DB_NAME',     'dvqeyxmy_ttfinder');
define('DB_USER',     '');           // your Bluehost DB username
define('DB_PASS',     '');           // your Bluehost DB password
define('DB_CHARSET',  'utf8mb4');

define('APP_BASE',    '/ttfinder'); // change to '' when on subdomain or root domain
define('APP_ENV',     'production');

define('SESSION_SECRET', '');       // random long string

// Cloudinary
define('CLOUDINARY_CLOUD_NAME', '');
define('CLOUDINARY_API_KEY',    '');
define('CLOUDINARY_API_SECRET', '');

// Google Vision (photo moderation)
define('GOOGLE_VISION_API_KEY', '');

// Pusher (real-time chat)
define('PUSHER_APP_ID',  '');
define('PUSHER_KEY',     '');
define('PUSHER_SECRET',  '');
define('PUSHER_CLUSTER', 'us2');

// SMTP Email
define('SMTP_HOST',     '');
define('SMTP_PORT',     587);
define('SMTP_USER',     '');
define('SMTP_PASS',     '');
define('EMAIL_FROM',    'noreply@tostigames.com');
define('EMAIL_FROM_NAME', 'TTFinder');

// Google OAuth
define('GOOGLE_CLIENT_ID',     '');
define('GOOGLE_CLIENT_SECRET', '');
