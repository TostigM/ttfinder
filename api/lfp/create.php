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

$title          = trim($data['title'] ?? '');
$description    = trim($data['description'] ?? '');
$schedule_day   = trim($data['schedule_day'] ?? '');
$schedule_freq  = trim($data['schedule_frequency'] ?? '');
$schedule_time  = trim($data['schedule_time'] ?? '');
$safety_tools   = trim($data['safety_tools'] ?? '');
$language       = trim($data['language'] ?? '');
$location_type  = trim($data['location_type'] ?? '');
$location_town  = trim($data['location_town'] ?? '');
$location_state = trim($data['location_state'] ?? '');
$location_country = trim($data['location_country'] ?? '');
$slots_total    = isset($data['player_slots_total']) && $data['player_slots_total'] !== '' ? (int) $data['player_slots_total'] : null;
$distance_pref  = isset($data['distance_preference']) ? (int) $data['distance_preference'] : 25;
$distance_pref  = in_array($distance_pref, [5, 10, 15, 25, 50, 100]) ? $distance_pref : 25;
$systems        = array_filter(array_map('trim', $data['systems'] ?? []), fn($s) => $s !== '');

if (!$title)          json_error('A title is required.');
if (empty($systems))  json_error('Please add at least one TTRPG system.');
if (!$location_town)  json_error('Please enter a town or city.');
if (!$location_state) json_error('Please enter a state or region.');

// Geocode location
$lat = null;
$lng = null;
$coords = geocode($location_town, $location_state, $location_country);
if ($coords) {
    $lat = $coords['lat'];
    $lng = $coords['lng'];
}

$pdo  = db();
$stmt = $pdo->prepare('
    INSERT INTO lfp_listings
        (user_id, title, description, schedule_day, schedule_frequency, schedule_time,
         safety_tools, language, location_type, location_town, location_state, location_country,
         location_lat, location_lng, distance_preference, player_slots_total, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
');
$stmt->execute([
    $user['id'], $title, $description, $schedule_day, $schedule_freq, $schedule_time,
    $safety_tools, $language ?: null, $location_type, $location_town, $location_state,
    $location_country ?: null, $lat, $lng, $distance_pref, $slots_total,
]);
$listingId = $pdo->lastInsertId();

$sStmt = $pdo->prepare('INSERT INTO lfp_systems (lfp_listing_id, system_name) VALUES (?, ?)');
foreach ($systems as $system) {
    $sStmt->execute([$listingId, $system]);
}

json_response(['message' => 'Listing created.', 'listing_id' => (int) $listingId], 201);
