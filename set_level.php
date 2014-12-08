<?php
include "connect.php";
header('Access-Control-Allow-Origin: *');
session_start();

$level_id = $_GET['id'];
if($level_id != "" && isset($_SESSION["user_id"])) {
	$user_id = $_SESSION['user_id'];
	$conn = connect();

	$query  = "UPDATE user SET level_id = $level_id WHERE user_id = $user_id;";
    $res    = $conn->query($query);

    $conn->close();

    echo "true";
} else {
	echo "false";
}
?>