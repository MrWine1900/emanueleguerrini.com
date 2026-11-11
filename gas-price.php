<?php
declare(strict_types=1);
// Read-only public benchmark: keep every other JSON and PHP config inaccessible.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=1800, must-revalidate');
header('X-Content-Type-Options: nosniff');
$path = __DIR__ . '/data/gas-price.json';
if (!is_file($path) || !is_readable($path)) {
    http_response_code(503);
    echo '{"error":"benchmark_unavailable"}';
    exit;
}
$data = file_get_contents($path);
$parsed = json_decode($data ?: '', true);
if (!is_array($parsed)
    || !isset($parsed['reference_month'], $parsed['eur_mwh'], $parsed['pcs_gj_per_smc'])
    || !preg_match('/^20\d{2}-(0[1-9]|1[0-2])$/', (string)$parsed['reference_month'])) {
    http_response_code(503);
    echo '{"error":"benchmark_invalid"}';
    exit;
}
echo json_encode($parsed, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
