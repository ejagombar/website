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

// Use prepared statement to prevent SQL injection
$stmt = $dbc->prepare("SELECT `image` FROM `Recipes` WHERE CONVERT(`index` USING utf8) = ?");
if (!$stmt) {
    die("Prepare failed: " . $dbc->error);
}

$stmt->bind_param("s", $inputId);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if($row['image']) {
        $im = imagecreatefromstring($row['image']);
        if ($im !== false) {
            header('Content-Type: image/png');
            imagepng($im);
            imagedestroy($im);
        } else {
            echo 'An error occurred.';
        }
    } else {
        echo 'No image found.';
    }
} else {
    echo 'Recipe not found.';
}

$stmt->close();
$dbc->close();
?>