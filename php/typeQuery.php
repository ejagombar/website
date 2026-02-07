<?php

$dbUser = getenv('DB_USER');
$dbPass = getenv('DB_PASS');
$dbHost = getenv('DB_HOST');
$dbName = getenv('DB_NAME');

$dbc = mysqli_connect($dbHost, $dbUser, $dbPass, $dbName);

if (!$dbc) {
    die("Database connection failed: " . mysqli_connect_error());
}

$xml = new SimpleXMLElement('<xml/>');

/**
 * SQL Order Logic Breakdown:
 * 1. Specific priority list gets Zone 0.
 * 2. Anything else (extras) gets Zone 1.
 * 3. 'Other' gets Zone 2.
 */
$query = "SELECT DISTINCT `type` FROM `Recipes` 
          ORDER BY 
            CASE 
                WHEN `type` = 'other' THEN 2 
                WHEN `type` IN ('main', 'dessert', 'cake', 'starter', 'soup', 'side', 'salad', 'dressing', 'drink') THEN 0 
                ELSE 1 
            END ASC,
            FIELD(`type`, 'main', 'dessert', 'cake', 'starter', 'soup', 'side', 'salad', 'dressing', 'drink') ASC,
            `type` ASC";

$stmt = $dbc->prepare($query);
if (!$stmt) {
    die("Prepare failed: " . $dbc->error);
}

$stmt->execute();
$result = $stmt->get_result();

while($row = $result->fetch_assoc()) {
    // ucfirst() ensures 'main' becomes 'Main' for a cleaner XML feed
    $formattedType = ucfirst(strtolower($row['type']));
    $xml->addChild('type', htmlspecialchars($formattedType));
}

$stmt->close();
$dbc->close();

header("Access-Control-Allow-Origin: *");
header("Content-Type: text/xml; charset=UTF-8");

echo $xml->asXML();
