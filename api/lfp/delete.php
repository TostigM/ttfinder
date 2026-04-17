<?php
session_start();
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/helpers.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$user = require_auth();
$data = json_decode(file_get_contents('php://input'), true);
$id   = (int) ($data['id'] ?? 0);
if (!$id) json_error('Listing ID required.');

$pdo  = db();

// Confirm ownership before deleting
$stmt = $pdo->prepare('SELECT id FROM lfp_listings WHERE id = ? AND user_id = ?');
$stmt->execute([$id, $user['id']]);
if (!$stmt->fetch()) json_error('Listing not found.', 404);

// lfp_systems deleted automatically via ON DELETE CASCADE
$pdo->prepare('DELETE FROM lfp_listings WHERE id = ? AND user_id = ?')->execute([$id, $user['id']]);

json_response(['message' => 'Listing deleted.']);
