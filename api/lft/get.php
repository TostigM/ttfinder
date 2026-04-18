<?php
session_start();
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/helpers.php';

header('Content-Type: application/json');

$user = require_auth();
$pdo  = db();

$stmt = $pdo->prepare('SELECT * FROM lft_profiles WHERE user_id = ?');
$stmt->execute([$user['id']]);
$profile = $stmt->fetch();

if (!$profile) {
    json_response(['profile' => null]);
}

// Fetch systems
$stmt = $pdo->prepare('SELECT system_name FROM lft_systems WHERE lft_profile_id = ?');
$stmt->execute([$profile['id']]);
$systems = $stmt->fetchAll(PDO::FETCH_COLUMN);

$profile['systems']             = $systems;
$profile['id']                  = (int) $profile['id'];
$profile['user_id']             = (int) $profile['user_id'];
$profile['is_active']           = (bool) $profile['is_active'];
$profile['distance_preference'] = (int) $profile['distance_preference'];

// Never expose coordinates
unset($profile['location_lat'], $profile['location_lng']);

json_response(['profile' => $profile]);
