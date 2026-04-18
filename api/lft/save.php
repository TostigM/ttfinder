<?php
session_start();
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/helpers.php';
require_once __DIR__ . '/../../includes/geocode.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$user = require_auth();
$data = json_decode(file_get_contents('php://input'), true);

$availability       = trim($data['availability'] ?? '');
$bio                = trim($data['bio'] ?? '');
$visibility         = in_array($data['visibility'] ?? '', ['public', 'private']) ? $data['visibility'] : 'public';
$systems            = array_filter(array_map('trim', $data['systems'] ?? []), fn($s) => $s !== '');
$is_active          = !empty($data['is_active']) ? 1 : 0;
$language           = trim($data['language'] ?? '');
$location_town      = trim($data['location_town'] ?? '');
$location_state     = trim($data['location_state'] ?? '');
$location_country   = trim($data['location_country'] ?? '');
$distance_pref      = isset($data['distance_preference']) ? (int) $data['distance_preference'] : 25;
$distance_pref      = in_array($distance_pref, [5, 10, 15, 25, 50, 100]) ? $distance_pref : 25;

if (empty($systems)) json_error('Please add at least one TTRPG system.');

// Geocode if location provided
$lat = null;
$lng = null;
if ($location_town || $location_state || $location_country) {
    $coords = geocode($location_town, $location_state, $location_country);
    if ($coords) {
        $lat = $coords['lat'];
        $lng = $coords['lng'];
    }
}

$pdo = db();

// Check if profile exists
$stmt = $pdo->prepare('SELECT id, qr_token, location_lat, location_lng FROM lft_profiles WHERE user_id = ?');
$stmt->execute([$user['id']]);
$existing = $stmt->fetch();

if ($existing) {
    $qr_token = $existing['qr_token'];
    if ($visibility === 'private' && !$qr_token) {
        $qr_token = bin2hex(random_bytes(32));
    }
    // Keep existing coords if new geocoding failed but location fields changed
    if ($lat === null && ($location_town || $location_state || $location_country)) {
        $lat = $existing['location_lat'] ? (float) $existing['location_lat'] : null;
        $lng = $existing['location_lng'] ? (float) $existing['location_lng'] : null;
    }
    $stmt = $pdo->prepare('
        UPDATE lft_profiles
        SET availability = ?, bio = ?, visibility = ?, qr_token = ?, is_active = ?,
            language = ?, location_town = ?, location_state = ?, location_country = ?,
            location_lat = ?, location_lng = ?, distance_preference = ?, updated_at = NOW()
        WHERE user_id = ?
    ');
    $stmt->execute([
        $availability, $bio, $visibility, $qr_token, $is_active,
        $language ?: null, $location_town ?: null, $location_state ?: null, $location_country ?: null,
        $lat, $lng, $distance_pref, $user['id'],
    ]);
    $profileId = $existing['id'];
} else {
    $qr_token = $visibility === 'private' ? bin2hex(random_bytes(32)) : null;
    $stmt = $pdo->prepare('
        INSERT INTO lft_profiles
            (user_id, availability, bio, visibility, qr_token, is_active,
             language, location_town, location_state, location_country,
             location_lat, location_lng, distance_preference)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $user['id'], $availability, $bio, $visibility, $qr_token, $is_active,
        $language ?: null, $location_town ?: null, $location_state ?: null, $location_country ?: null,
        $lat, $lng, $distance_pref,
    ]);
    $profileId = $pdo->lastInsertId();
}

// Replace systems
$pdo->prepare('DELETE FROM lft_systems WHERE lft_profile_id = ?')->execute([$profileId]);
$sStmt = $pdo->prepare('INSERT INTO lft_systems (lft_profile_id, system_name) VALUES (?, ?)');
foreach ($systems as $system) {
    $sStmt->execute([$profileId, $system]);
}

json_response(['message' => 'LFT profile saved.', 'profile_id' => (int) $profileId]);
