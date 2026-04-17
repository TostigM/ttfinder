<?php
session_start();
require_once __DIR__ . '/../../includes/helpers.php';

header('Content-Type: application/json');

if (empty($_SESSION['user_id'])) {
    json_response(['user' => null]);
}

json_response([
    'user' => [
        'id'           => (int) $_SESSION['user_id'],
        'email'        => $_SESSION['user_email'],
        'display_name' => $_SESSION['user_display_name'],
        'is_moderator' => (bool) ($_SESSION['is_moderator'] ?? false),
    ]
]);
