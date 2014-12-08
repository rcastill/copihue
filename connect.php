<?php
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
?>