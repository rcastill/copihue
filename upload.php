<?php

include 'connect.php';

if (!(isset($_POST["title"]) && isset($_POST["difficulty"])))
    echo "Title/Difficulty not specified!";

else if (!isset($_POST["data"]))
    echo "Missing data";

else {
    session_start();
    if (!isset($_SESSION["user_id"])) {
        die("Not connected while editing");
    }

    $conn = connect();

    $user_id = $_SESSION["user_id"];
    $author_query = "SELECT username FROM user WHERE user_id=$user_id";
    $author_result = $conn->query($author_query);

    if ($author_result->num_rows == 0) {
        die("NUM_ROWS=0");
    }

    $author = $author_result->fetch_assoc()["username"];
    $data = $_POST["data"];
    $diff = $_POST["difficulty"];
    $title = $_POST["title"];

    $query = "INSERT INTO level (data, difficulty, author, title) VALUES ('$data', '$diff', '$author', '$title')";

    if ($conn->query($query))
        echo 1;
    else
        echo "Failed to register upload";

    $conn->close();
}
?>