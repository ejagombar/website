<?php
header ('Content-type: text/html; charset=UTF-8');

$dbUser = getenv('DB_USER');
$dbPass = getenv('DB_PASS');
$dbHost = getenv('DB_HOST');
$dbName = getenv('DB_NAME');

$dbc = mysqli_connect($dbHost, $dbUser, $dbPass, $dbName);

if (!$dbc) {
    printf("DBHOST: %s\n", $dbHost);
    die("Database connection failed: " . mysqli_connect_error());
}

$dbc->set_charset("utf8");

$inputType = isset($_GET["type"]) ? trim($_GET["type"]) : "%";
$keywordRaw = isset($_GET["keyword"]) ? trim($_GET["keyword"]) : "";

$xml = new SimpleXMLElement('<xml/>');

if(isset($_GET["searchIngredients"]) && !empty($keywordRaw)) {
    // 1. Split keywords by comma and clean them up
    $keywords = explode(',', $keywordRaw);
    $keywords = array_map('trim', $keywords);
    
    // 2. Build the dynamic WHERE clause for ingredients
    // We want: (ingredients LIKE ?) OR (ingredients LIKE ?) ...
    $likeClauses = [];
    $params = [$inputType]; // First param is always 'type'
    $types = "s";           // First type is 's' for 'type'
    
    foreach ($keywords as $word) {
        $likeClauses[] = "(ingredients LIKE ?)";
        $params[] = "%" . $word . "%";
        $types .= "s";
    }
    
    $ingredientQuery = implode(" AND", $likeClauses);
    $sql = "SELECT * FROM `Recipes` WHERE (type LIKE ?) AND ($ingredientQuery) ORDER BY name ASC";
    
    $stmt = $dbc->prepare($sql);
    // Use call_user_func_array or the splat operator (...) for dynamic binding
    $stmt->bind_param($types, ...$params);

} else {
    // Standard search by name
    $inputKeyword = "%" . $keywordRaw . "%";
    $stmt = $dbc->prepare("SELECT * FROM `Recipes` WHERE (type LIKE ?) AND (name LIKE ?) ORDER BY name ASC");
    $stmt->bind_param("ss", $inputType, $inputKeyword);
}

$stmt->execute();
$result = $stmt->get_result();

while($row = $result->fetch_assoc()) {
    $recipe = $xml->addChild('recipe');
    $recipe->addChild('name', htmlspecialchars($row['name'] ?? '', ENT_XHTML, 'UTF-8'));
    $recipe->addChild('index', $row['index']);
}

$stmt->close();
$dbc->close();

header("Access-Control-Allow-Origin: *");
header("Content-Type: text/xml; charset=UTF-8");
echo $xml->asXML();
?>
