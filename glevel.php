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

$level_id = $_GET['id'];
if($level_id != "") {
	$conn = connect();

	$query  = "SELECT * FROM level WHERE id='$level_id'";
    $res    = $conn->query($query);
    $data   = $res->fetch_assoc();

    $level   = array(
    	"difficulty" => $data['difficulty'],
    	"author" => $data['author'],
    	"title" => $data['title'],
    	"data" => json_decode($data['data']),
    	"id" => $data['id'],
    );

    echo json_encode($level);
	$conn->close();
} else {
	echo "false";
}
?>