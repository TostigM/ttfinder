<?php
session_start();
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/helpers.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$user = require_auth();
$data = json_decode(file_get_contents('php://input'), true);
$lang = trim($data['language'] ?? '');

$allowed = ['en', 'fr', 'de', 'es', 'ja', 'pt', 'it', 'sv'];
if (!in_array($lang, $allowed, true)) json_error('Unsupported language.');

$pdo = db();
$pdo->prepare('UPDATE users SET ui_language = ? WHERE id = ?')
    ->execute([$lang, $user['id']]);

$_SESSION['ui_language'] = $lang;

json_response(['language' => $lang]);
