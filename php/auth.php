<?php
/**
 * Authentication endpoint for Recipe Uploader
 *
 * Environment variables required:
 * - ADMIN_PASS_HASH: Password hash generated with password_hash($password, PASSWORD_DEFAULT)
 *
 * To generate a hash, run:
 * php -r "echo password_hash('your_password_here', PASSWORD_DEFAULT) . PHP_EOL;"
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: https://eagombar.uk');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Password required']);
    exit();
}

$passwordHash = getenv('ADMIN_PASS_HASH');

if (!$passwordHash) {
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error']);
    exit();
}

if (password_verify($input['password'], $passwordHash)) {
    $_SESSION['authenticated'] = true;
    $_SESSION['auth_time'] = time();
    echo json_encode(['success' => true]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid password']);
}
?>
