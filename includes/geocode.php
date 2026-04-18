<?php
// TTFinder — Nominatim geocoding helper
// Converts a human-readable location to lat/lng.
// Rate limit: 1 req/sec (Nominatim ToS). Only call at save time, not on browse.

/**
 * Geocode a location string using OpenStreetMap Nominatim.
 *
 * @param  string $town    Town or city name
 * @param  string $state   State, region, or province
 * @param  string $country Country name or code
 * @return array|null      ['lat' => float, 'lng' => float] or null on failure
 */
function geocode(string $town, string $state, string $country): ?array {
    $parts = array_filter(array_map('trim', [$town, $state, $country]));
    if (empty($parts)) return null;

    $query = urlencode(implode(', ', $parts));
    $url   = "https://nominatim.openstreetmap.org/search?q={$query}&format=json&limit=1&addressdetails=0";

    $ctx = stream_context_create([
        'http' => [
            'method'  => 'GET',
            'header'  => "User-Agent: TTFinder/1.0 (tostig.meadbrewer@gmail.com)\r\n",
            'timeout' => 6,
        ],
    ]);

    $raw = @file_get_contents($url, false, $ctx);
    if ($raw === false) return null;

    $data = json_decode($raw, true);
    if (empty($data[0]['lat'])) return null;

    return [
        'lat' => (float) $data[0]['lat'],
        'lng' => (float) $data[0]['lon'],
    ];
}
