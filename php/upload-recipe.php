<?php
/**
 * Recipe Upload endpoint
 *
 * Environment variables required:
 * - DB_WRITE_USER: Database user with INSERT permissions
 * - DB_WRITE_PASS: Database password
 * - DB_HOST: Database host
 * - DB_NAME: Database name
 */

header('Content-Type: application/json; charset=UTF-8');

// Allow both production and local development
$allowedOrigins = ['https://eagombar.uk'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}

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

// Validate required fields
if (empty($input['name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Recipe name is required']);
    exit();
}

if (empty($input['type'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Recipe type is required']);
    exit();
}

if (empty($input['ingredients']) || count($input['ingredients']) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'At least one ingredient is required']);
    exit();
}

if (empty($input['instructions']) || count($input['instructions']) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'At least one instruction is required']);
    exit();
}

// Database connection
$dbUser = getenv('DB_WRITE_USER');
$dbPass = getenv('DB_WRITE_PASS');
$dbHost = getenv('DB_HOST');
$dbName = getenv('DB_NAME');

$dbc = mysqli_connect($dbHost, $dbUser, $dbPass, $dbName);
if (!$dbc) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

if (!$dbc->set_charset("utf8")) {
    http_response_code(500);
    echo json_encode(['error' => 'Character set error']);
    exit();
}

// Prepare data
$name = trim($input['name']);
$description = trim($input['description'] ?? '');
$type = trim($input['type']);
$source = trim($input['source'] ?? '');
$sourceLink = trim($input['source_link'] ?? '');
$prepTime = trim($input['preparation_time'] ?? '');
$cookTime = trim($input['cooking_time'] ?? '');
$temperature = trim($input['temperature'] ?? '');
$serves = trim($input['serves'] ?? '');
$makes = trim($input['makes'] ?? '');
$image = trim($input['image'] ?? '');

// Decode base64 image data if present
if (strpos($image, 'data:image/') === 0) {
    $commaPos = strpos($image, ',');
    if ($commaPos !== false) {
        $image = base64_decode(substr($image, $commaPos + 1));
    }
}

// Join ingredients with newlines
$ingredients = implode("\n", array_filter(array_map('trim', $input['ingredients'])));

// Instructions (up to 16)
$instructions = array_fill(0, 16, '');
foreach ($input['instructions'] as $i => $inst) {
    if ($i >= 16) break;
    $instructions[$i] = trim($inst);
}

// Build query
$sql = "INSERT INTO `Recipes` (
    `name`, `ingredients`, `description`, `type`,
    `instructions_1`, `instructions_2`, `instructions_3`, `instructions_4`,
    `instructions_5`, `instructions_6`, `instructions_7`, `instructions_8`,
    `instructions_9`, `instructions_10`, `instructions_11`, `instructions_12`,
    `instructions_13`, `instructions_14`, `instructions_15`, `instructions_16`,
    `preparation_time`, `cooking_time`, `temperature`, `serves`, `makes`, `source`, `source_link`, `image`
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $dbc->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Prepare failed: ' . $dbc->error]);
    exit();
}

$stmt->bind_param(
    "ssssssssssssssssssssssssssss",
    $name, $ingredients, $description, $type,
    $instructions[0], $instructions[1], $instructions[2], $instructions[3],
    $instructions[4], $instructions[5], $instructions[6], $instructions[7],
    $instructions[8], $instructions[9], $instructions[10], $instructions[11],
    $instructions[12], $instructions[13], $instructions[14], $instructions[15],
    $prepTime, $cookTime, $temperature, $serves, $makes, $source, $sourceLink, $image
);

if ($stmt->execute()) {
    $newId = $stmt->insert_id;
    echo json_encode(['success' => true, 'id' => $newId]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Insert failed: ' . $stmt->error]);
}

$stmt->close();
$dbc->close();
?>

