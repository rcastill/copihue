<?php
// set connection to database.
include "connect.php";

header('Access-Control-Allow-Origin: *');

$level_id = $_GET['id'];
if($level_id != "") {
	$conn = connect();

	$query  = "SELECT * FROM level WHERE id='$level_id';";
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