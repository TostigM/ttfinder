<?php
session_start();
require_once __DIR__ . '/../../includes/helpers.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

$_SESSION = [];
session_destroy();

json_response(['message' => 'Logged out.']);
