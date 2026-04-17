<?php
session_start();
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/helpers.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

$data     = json_decode(file_get_contents('php://input'), true);
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    json_error('Email and password are required.');
}

$pdo  = db();
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

// Use a constant-time comparison to avoid timing attacks
if (!$user || !password_verify($password, $user['password_hash'])) {
    json_error('Invalid email or password.', 401);
}

if ($user['is_banned']) {
    json_error('Your account has been suspended.', 403);
}

// Start session
$_SESSION['user_id']           = (int) $user['id'];
$_SESSION['user_email']        = $user['email'];
$_SESSION['user_display_name'] = $user['display_name'];
$_SESSION['is_moderator']      = (bool) $user['is_moderator'];
session_regenerate_id(true);

json_response([
    'user' => [
        'id'           => (int) $user['id'],
        'email'        => $user['email'],
        'display_name' => $user['display_name'],
        'is_moderator' => (bool) $user['is_moderator'],
    ]
]);
