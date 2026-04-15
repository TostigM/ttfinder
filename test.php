<?php
// TTFinder — Server test page
// Visit tostigames.com/ttfinder/test.php to verify PHP and DB are working.
// Delete or restrict this file before going live.

require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';

$checks = [];

// PHP version
$checks['PHP version'] = [
    'ok'  => version_compare(PHP_VERSION, '8.0', '>='),
    'val' => PHP_VERSION,
];

// PDO MySQL extension
$checks['PDO MySQL'] = [
    'ok'  => extension_loaded('pdo_mysql'),
    'val' => extension_loaded('pdo_mysql') ? 'available' : 'MISSING',
];

// Database connection
try {
    $pdo = db();
    $row = $pdo->query('SELECT VERSION() AS v')->fetch();
    $checks['Database'] = ['ok' => true, 'val' => $row['v']];
} catch (Exception $e) {
    $checks['Database'] = ['ok' => false, 'val' => $e->getMessage()];
}

// Config sanity check
$checks['APP_BASE'] = ['ok' => true, 'val' => APP_BASE];
$checks['APP_ENV']  = ['ok' => true, 'val' => APP_ENV];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>TTFinder — Server Test</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 60px auto; padding: 0 20px; background: #0f0f0f; color: #e5e5e5; }
    h1   { color: #818cf8; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #333; font-size: 0.9em; }
    .ok  { color: #4ade80; }
    .fail{ color: #f87171; }
    .note { margin-top: 24px; color: #6b7280; font-size: 0.8em; }
  </style>
</head>
<body>
  <h1>TTFinder — Server Test</h1>
  <table>
    <tr><th>Check</th><th>Status</th><th>Value</th></tr>
    <?php foreach ($checks as $label => $result): ?>
    <tr>
      <td><?= htmlspecialchars($label) ?></td>
      <td class="<?= $result['ok'] ? 'ok' : 'fail' ?>"><?= $result['ok'] ? '✓ OK' : '✗ FAIL' ?></td>
      <td><?= htmlspecialchars($result['val']) ?></td>
    </tr>
    <?php endforeach; ?>
  </table>
  <p class="note">Delete or password-protect test.php before going live.</p>
</body>
</html>
