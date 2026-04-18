<?php
// Public browse endpoint — no auth required.
// Returns active LFP listings, optionally filtered by distance, language, and system.
// Coordinates are NEVER returned; distance values are NEVER returned.

session_start();
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/helpers.php';
require_once __DIR__ . '/../../includes/geocode.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$pdo = db();

$language = trim($_GET['language'] ?? '');
$system   = trim($_GET['system']   ?? '');
$location = trim($_GET['location'] ?? '');
$distance = isset($_GET['distance']) ? (int) $_GET['distance'] : null;
if ($distance !== null) {
    $distance = in_array($distance, [5, 10, 15, 25, 50, 100]) ? $distance : 25;
}

// ── Resolve coordinates ───────────────────────────────────────────────────────
$lat = null;
$lng = null;

// 1. Logged-in user with a geocoded LFT profile → use their stored location
if (!empty($_SESSION['user_id'])) {
    $stmt = $pdo->prepare('SELECT location_lat, location_lng FROM lft_profiles WHERE user_id = ? AND location_lat IS NOT NULL');
    $stmt->execute([$_SESSION['user_id']]);
    $row = $stmt->fetch();
    if ($row) {
        $lat = (float) $row['location_lat'];
        $lng = (float) $row['location_lng'];
    }
}

// 2. Fallback: geocode a location string provided by the client
if ($lat === null && $location !== '') {
    $coords = geocode($location, '', '');
    if ($coords) {
        $lat = $coords['lat'];
        $lng = $coords['lng'];
    }
}

// ── Build query ───────────────────────────────────────────────────────────────
$select = 'SELECT l.id, l.title, l.description,
               l.schedule_day, l.schedule_frequency, l.schedule_time,
               l.safety_tools, l.language,
               l.location_type, l.location_town, l.location_state, l.location_country,
               l.player_slots_total, l.player_slots_filled, l.distance_preference,
               l.created_at,
               u.display_name, u.display_preference';

$from  = 'FROM lfp_listings l
          JOIN users u ON u.id = l.user_id';

$where  = ['l.is_active = 1', 'u.is_banned = 0'];
$params = [];
$having = [];
$havingParams = [];

if ($language !== '') {
    $where[]  = 'l.language = ?';
    $params[] = $language;
}

if ($system !== '') {
    $from    .= ' JOIN lfp_systems ls ON ls.lfp_listing_id = l.id';
    $where[]  = 'ls.system_name = ?';
    $params[] = $system;
}

// Distance filtering via Haversine (only when we have coordinates)
if ($lat !== null && $distance !== null) {
    $having[]       = '(3959 * acos(cos(radians(?)) * cos(radians(l.location_lat)) * cos(radians(l.location_lng) - radians(?)) + sin(radians(?)) * sin(radians(l.location_lat)))) <= ?';
    $havingParams   = [$lat, $lng, $lat, $distance];
    // Exclude listings with no coordinates when distance filter is active
    $where[]        = 'l.location_lat IS NOT NULL';
}

$whereClause  = 'WHERE ' . implode(' AND ', $where);
$havingClause = $having ? ('HAVING ' . implode(' AND ', $having)) : '';
$orderClause  = 'ORDER BY l.created_at DESC';

$sql = "{$select} {$from} {$whereClause} GROUP BY l.id {$havingClause} {$orderClause}";
$stmt = $pdo->prepare($sql);
$stmt->execute(array_merge($params, $havingParams));
$listings = $stmt->fetchAll();

// Attach systems; sanitise types; strip any sensitive fields
$sStmt = $pdo->prepare('SELECT system_name FROM lfp_systems WHERE lfp_listing_id = ? ORDER BY system_name');
foreach ($listings as &$l) {
    $sStmt->execute([$l['id']]);
    $l['systems']             = $sStmt->fetchAll(PDO::FETCH_COLUMN);
    $l['id']                  = (int) $l['id'];
    $l['player_slots_total']  = $l['player_slots_total']  !== null ? (int) $l['player_slots_total']  : null;
    $l['player_slots_filled'] = (int) $l['player_slots_filled'];
    $l['distance_preference'] = (int) $l['distance_preference'];
    // Never expose lat/lng (already not in SELECT, but belt-and-suspenders)
    unset($l['location_lat'], $l['location_lng']);
}

json_response([
    'listings'       => $listings,
    'count'          => count($listings),
    'location_found' => $lat !== null,
]);
