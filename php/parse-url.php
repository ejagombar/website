<?php
/**
 * Recipe URL Parser endpoint
 * Calls Python script to extract recipe data from a URL
 *
 * Requires Python script at: /path/to/recipe_parser.py
 * Set RECIPE_PARSER_PATH environment variable
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

// Check authentication
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['url'])) {
    http_response_code(400);
    echo json_encode(['error' => 'URL is required']);
    exit();
}

$url = filter_var($input['url'], FILTER_VALIDATE_URL);
if (!$url) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid URL']);
    exit();
}

// Get parser path from environment
$parserPath = getenv('RECIPE_PARSER_PATH') ?: '/opt/recipe-parser/recipe_parser.py';
$pythonPath = getenv('PYTHON_PATH') ?: 'python3';

if (!file_exists($parserPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Recipe parser not configured']);
    exit();
}

// Execute Python script
$escapedUrl = escapeshellarg($url);
$command = "$pythonPath $parserPath $escapedUrl 2>&1";
$output = shell_exec($command);

if ($output === null) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to execute parser']);
    exit();
}

// Parse JSON output from Python script
$result = json_decode($output, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(['error' => 'Parser returned invalid data', 'details' => $output]);
    exit();
}

if (isset($result['error'])) {
    http_response_code(400);
    echo json_encode(['error' => $result['error']]);
    exit();
}

echo json_encode(['success' => true, 'recipe' => $result]);
?>
