<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/includes/config.php';

$base = APP_BASE;

// Pass current session user to JS (null if not logged in)
$currentUser = null;
if (!empty($_SESSION['user_id'])) {
    $currentUser = [
        'id'           => (int) $_SESSION['user_id'],
        'email'        => $_SESSION['user_email'],
        'display_name' => $_SESSION['user_display_name'],
        'is_moderator' => (bool) ($_SESSION['is_moderator'] ?? false),
    ];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TTFinder — Find Your Table</title>

  <!-- Tailwind CSS (CDN) -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="<?= $base ?>/assets/favicon.ico" />
</head>
<body class="bg-gray-950 text-gray-100 min-h-screen">

  <!-- App shell — JavaScript renders into #app -->
  <div id="app">
    <div class="flex items-center justify-center min-h-screen">
      <p class="text-gray-500 text-sm">Loading TTFinder…</p>
    </div>
  </div>

  <!-- Pass server config and session user to JS -->
  <script>
    window.TTFinder = {
      base: '<?= $base ?>',
      env:  '<?= APP_ENV ?>',
      user: <?= json_encode($currentUser) ?>,
    };
  </script>

  <!-- Main app entry point -->
  <script type="module" src="<?= $base ?>/assets/js/app.js"></script>
</body>
</html>
