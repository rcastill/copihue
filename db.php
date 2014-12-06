<?php


$server = "localhost";
$username = "root";
$password = "copihueon2014";
$dbname = "copihue";

$conn = mysqli_connect($server, $username, $password, $dbname);

if (!$conn)
    die("Connection error: " . mysqli_connect_error());

$email = $_POST["email"];
$passwd = "";

if (array_key_exists("passwd", $_POST)) {
    $passwd = $_POST["passwd"];
}

$usr = $_POST["username"];

$query = "INSERT INTO user (email, passwd, username, level_id) VALUES ('$email', '$passwd', '$usr', -1)";

if (mysqli_query($conn, $query)) {
    echo "1";

} else {
    echo "Error: " . $query . "<br>" . mysqli_error($conn);
}

mysqli_close($conn);


?>