<?php
/**
 * Check authentication status
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: https://eagombar.uk');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// Session expires after 24 hours
$sessionTimeout = 86400;

if (isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true) {
    if (isset($_SESSION['auth_time']) && (time() - $_SESSION['auth_time']) < $sessionTimeout) {
        echo json_encode(['authenticated' => true]);
    } else {
        // Session expired
        session_destroy();
        echo json_encode(['authenticated' => false]);
    }
} else {
    echo json_encode(['authenticated' => false]);
}
?>
