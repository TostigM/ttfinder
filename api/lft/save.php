<?php
session_start();
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/helpers.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$user = require_auth();
$data = json_decode(file_get_contents('php://input'), true);

$availability = trim($data['availability'] ?? '');
$bio          = trim($data['bio'] ?? '');
$visibility   = in_array($data['visibility'] ?? '', ['public', 'private']) ? $data['visibility'] : 'public';
$systems      = array_filter(array_map('trim', $data['systems'] ?? []), fn($s) => $s !== '');
$is_active    = !empty($data['is_active']) ? 1 : 0;

if (empty($systems)) json_error('Please add at least one TTRPG system.');

$pdo = db();

// Check if profile exists
$stmt = $pdo->prepare('SELECT id, qr_token FROM lft_profiles WHERE user_id = ?');
$stmt->execute([$user['id']]);
$existing = $stmt->fetch();

if ($existing) {
    // Update
    $qr_token = $existing['qr_token'];
    if ($visibility === 'private' && !$qr_token) {
        $qr_token = bin2hex(random_bytes(32));
    }
    $stmt = $pdo->prepare('
        UPDATE lft_profiles
        SET availability = ?, bio = ?, visibility = ?, qr_token = ?, is_active = ?, updated_at = NOW()
        WHERE user_id = ?
    ');
    $stmt->execute([$availability, $bio, $visibility, $qr_token, $is_active, $user['id']]);
    $profileId = $existing['id'];
} else {
    // Insert
    $qr_token = $visibility === 'private' ? bin2hex(random_bytes(32)) : null;
    $stmt = $pdo->prepare('
        INSERT INTO lft_profiles (user_id, availability, bio, visibility, qr_token, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([$user['id'], $availability, $bio, $visibility, $qr_token, $is_active]);
    $profileId = $pdo->lastInsertId();
}

// Replace systems
$pdo->prepare('DELETE FROM lft_systems WHERE lft_profile_id = ?')->execute([$profileId]);
$sStmt = $pdo->prepare('INSERT INTO lft_systems (lft_profile_id, system_name) VALUES (?, ?)');
foreach ($systems as $system) {
    $sStmt->execute([$profileId, $system]);
}

json_response(['message' => 'LFT profile saved.', 'profile_id' => (int) $profileId]);
