<?php
session_start();
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/helpers.php';

header('Content-Type: application/json');

$user = require_auth();
$pdo  = db();

$stmt = $pdo->prepare('SELECT * FROM lfp_listings WHERE user_id = ? ORDER BY created_at DESC');
$stmt->execute([$user['id']]);
$listings = $stmt->fetchAll();

// Attach systems to each listing
$sStmt = $pdo->prepare('SELECT system_name FROM lfp_systems WHERE lfp_listing_id = ?');
foreach ($listings as &$listing) {
    $sStmt->execute([$listing['id']]);
    $listing['systems']             = $sStmt->fetchAll(PDO::FETCH_COLUMN);
    $listing['id']                  = (int) $listing['id'];
    $listing['user_id']             = (int) $listing['user_id'];
    $listing['is_active']           = (bool) $listing['is_active'];
    $listing['player_slots_total']  = $listing['player_slots_total'] !== null ? (int) $listing['player_slots_total'] : null;
    $listing['player_slots_filled'] = (int) $listing['player_slots_filled'];
    $listing['distance_preference'] = (int) $listing['distance_preference'];
    // Never expose coordinates
    unset($listing['location_lat'], $listing['location_lng']);
}

json_response(['listings' => $listings]);
