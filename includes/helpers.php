<?php
// JSON response helper
function json_response(mixed $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// JSON error helper
function json_error(string $message, int $status = 400): void {
    json_response(['error' => $message], $status);
}

// Require authenticated session; returns user array or sends 401
function require_auth(): array {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (empty($_SESSION['user_id'])) {
        json_error('Unauthorized', 401);
    }
    return ['id' => $_SESSION['user_id'], 'email' => $_SESSION['user_email']];
}

// Sanitize a string for safe output
function h(string $str): string {
    return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
