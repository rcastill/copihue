<?php
// set connection to database.
function connect() {
    $server = "localhost";
    $username = "root";
    $password = "copihueon2014";
    $dbname = "copihue";
    $conn = new mysqli($server, $username, $password, $dbname);
    if ($conn->connect_error)
        die("Connection error: " . $conn->connect_error);
    return $conn;
}

header('Access-Control-Allow-Origin: *');

$conn = connect();

$query  = "SELECT id FROM level";
$res    = $conn->query($query);

$ids = array();
while($row = $res->fetch_assoc())
	array_push($ids, intval($row['id']));

echo json_encode($ids);
$conn->close();
?>