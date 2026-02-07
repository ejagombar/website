<?php
header ('Content-type: text/html; charset=UTF-8');

$dbUser = getenv('DB_USER');
$dbPass = getenv('DB_PASS');
$dbHost = getenv('DB_HOST');
$dbName = getenv('DB_NAME');

$dbc = mysqli_connect($dbHost, $dbUser, $dbPass, $dbName);
if (!$dbc) {
    die("Database connection failed: " . mysqli_connect_error());
}

/* change character set to utf8 */
if (!$dbc->set_charset("utf8")) {
    printf("Error loading character set utf8: %s\n", $dbc->error);
    exit();
}

if(isset($_GET["id"])){
   $inputId = trim($_GET["id"]);
} else{
    printf("Must specify an id\n");
    exit();
}

$xml = new SimpleXMLElement('<xml/>');

// Use prepared statement to prevent SQL injection
$stmt = $dbc->prepare("SELECT * FROM `Recipes` WHERE CONVERT(`index` USING utf8) = ?");
if (!$stmt) {
    die("Prepare failed: " . $dbc->error);
}

$stmt->bind_param("s", $inputId);
$stmt->execute();
$result = $stmt->get_result();

while($row = $result->fetch_assoc()) {
    $recipe = $xml->addChild('recipe');
    if($row['name']) $recipe->addChild('name', htmlspecialchars($row['name'], ENT_XHTML, 'UTF-8'));
    if($row['ingredients']) $recipe->addChild('ingredients', htmlspecialchars($row['ingredients'], ENT_XHTML, 'UTF-8'));
    if($row['description']) $recipe->addChild('description', htmlspecialchars($row['description'], ENT_XHTML, 'UTF-8'));
    if($row['type']) $recipe->addChild('type', htmlspecialchars($row['type'], ENT_XHTML, 'UTF-8'));
    if($row['instructions_1']) $recipe->addChild('instructions_1', htmlspecialchars($row['instructions_1'], ENT_XHTML, 'UTF-8'));
    if($row['instructions_2']) $recipe->addChild('instructions_2', htmlspecialchars($row['instructions_2'], ENT_XHTML, 'UTF-8'));
    if($row['instructions_3']) $recipe->addChild('instructions_3', htmlspecialchars($row['instructions_3'], ENT_XHTML, 'UTF-8'));
    if($row['instructions_4']) $recipe->addChild('instructions_4', htmlspecialchars($row['instructions_4'], ENT_XHTML, 'UTF-8'));
    if($row['instructions_5']) $recipe->addChild('instructions_5', htmlspecialchars($row['instructions_5'], ENT_XHTML, 'UTF-8'));
    if($row['instructions_6']) $recipe->addChild('instructions_6', htmlspecialchars($row['instructions_6'], ENT_XHTML, 'UTF-8'));
    if($row['instructions_7']) $recipe->addChild('instructions_7', htmlspecialchars($row['instructions_7'], ENT_XHTML, 'UTF-8'));
    if($row['instructions_8']) $recipe->addChild('instructions_8', htmlspecialchars($row['instructions_8'], ENT_XHTML, 'UTF-8'));
    if($row['instructions_9']) $recipe->addChild('instructions_9', htmlspecialchars($row['instructions_9'], ENT_XHTML, 'UTF-8'));
    if($row['instructions_10']) $recipe->addChild('instructions_10', htmlspecialchars($row['instructions_10'], ENT_XHTML, 'UTF-8'));
    if($row['instructions_11']) $recipe->addChild('instructions_11', htmlspecialchars($row['instructions_11'], ENT_XHTML, 'UTF-8'));
    if($row['instructions_12']) $recipe->addChild('instructions_12', htmlspecialchars($row['instructions_12'], ENT_XHTML, 'UTF-8'));
    if($row['instructions_13']) $recipe->addChild('instructions_13', htmlspecialchars($row['instructions_13'], ENT_XHTML, 'UTF-8'));
    if($row['instructions_14']) $recipe->addChild('instructions_14', htmlspecialchars($row['instructions_14'], ENT_XHTML, 'UTF-8'));
    if($row['instructions_15']) $recipe->addChild('instructions_15', htmlspecialchars($row['instructions_15'], ENT_XHTML, 'UTF-8'));
    if($row['instructions_16']) $recipe->addChild('instructions_16', htmlspecialchars($row['instructions_16'], ENT_XHTML, 'UTF-8'));
    if($row['preparation_time']) $recipe->addChild('preparation_time', htmlspecialchars($row['preparation_time'], ENT_XHTML, 'UTF-8'));
    if($row['cooking_time']) $recipe->addChild('cooking_time', htmlspecialchars($row['cooking_time'], ENT_XHTML, 'UTF-8'));
    if($row['temperature']) $recipe->addChild('temperature', htmlspecialchars($row['temperature'], ENT_XHTML, 'UTF-8'));
    if($row['serves']) $recipe->addChild('serves', htmlspecialchars($row['serves'], ENT_XHTML, 'UTF-8'));
    if($row['makes']) $recipe->addChild('makes', htmlspecialchars($row['makes'], ENT_XHTML, 'UTF-8'));
    if($row['source']) $recipe->addChild('source', htmlspecialchars($row['source'], ENT_XHTML, 'UTF-8'));
    $recipe->addChild('image', $row['image']);
}

$stmt->close();
$dbc->close();

header("Access-Control-Allow-Origin: *");
header("Content-Type: text/xml; charset=UTF-8");

echo $xml->asXML();
?>
