<?php
session_start();
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/helpers.php';

header('Content-Type: application/json');

$user = require_auth();
$id   = (int) ($_GET['id'] ?? 0);
if (!$id) json_error('Listing ID required.', 400);

$pdo  = db();
$stmt = $pdo->prepare('SELECT * FROM lfp_listings WHERE id = ? AND user_id = ?');
$stmt->execute([$id, $user['id']]);
$listing = $stmt->fetch();

if (!$listing) json_error('Listing not found.', 404);

$stmt = $pdo->prepare('SELECT system_name FROM lfp_systems WHERE lfp_listing_id = ?');
$stmt->execute([$id]);
$listing['systems']             = $stmt->fetchAll(PDO::FETCH_COLUMN);
$listing['id']                  = (int) $listing['id'];
$listing['user_id']             = (int) $listing['user_id'];
$listing['is_active']           = (bool) $listing['is_active'];
$listing['player_slots_total']  = $listing['player_slots_total'] !== null ? (int) $listing['player_slots_total'] : null;
$listing['player_slots_filled'] = (int) $listing['player_slots_filled'];
$listing['distance_preference'] = (int) $listing['distance_preference'];
unset($listing['location_lat'], $listing['location_lng']);

json_response(['listing' => $listing]);
