<?php
session_start();
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/helpers.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

$data = json_decode(file_get_contents('php://input'), true);

// Validate input
$email        = trim($data['email'] ?? '');
$password     = $data['password'] ?? '';
$confirm      = $data['confirm_password'] ?? '';
$displayName  = trim($data['display_name'] ?? '');
$displayPref  = $data['display_preference'] ?? 'first_name';

if (!$email || !$password || !$displayName) {
    json_error('Email, password, and display name are required.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('Invalid email address.');
}
if (strlen($password) < 8) {
    json_error('Password must be at least 8 characters.');
}
if ($password !== $confirm) {
    json_error('Passwords do not match.');
}
if (!in_array($displayPref, ['first_name', 'initials'])) {
    $displayPref = 'first_name';
}

$pdo = db();

// Check email not already taken
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    json_error('An account with that email already exists.');
}

// Insert user
$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare('
    INSERT INTO users (email, password_hash, display_name, display_preference)
    VALUES (?, ?, ?, ?)
');
$stmt->execute([$email, $hash, $displayName, $displayPref]);
$userId = $pdo->lastInsertId();

// Start session
$_SESSION['user_id']           = (int) $userId;
$_SESSION['user_email']        = $email;
$_SESSION['user_display_name'] = $displayName;
$_SESSION['is_moderator']      = false;
session_regenerate_id(true);

json_response([
    'user' => [
        'id'           => (int) $userId,
        'email'        => $email,
        'display_name' => $displayName,
        'is_moderator' => false,
    ]
], 201);
