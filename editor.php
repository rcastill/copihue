<?php
session_start();
if (!isset($_SESSION["user_id"]))
    header("location:index.html");
?>

<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>TruckScript's Editor</title>
    <link href='http://fonts.googleapis.com/css?family=Lato:700|Roboto+Condensed' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="src/editor.css">
    <script src="vendor/jquery-2.1.1.min.js"></script>
    <script src="src/util.js"></script>
    <script src="src/editor.js"></script>
</head>
<body>

<div id="editor" style="display: none;">
    <canvas id="canvas"></canvas>
</div>

<div class="inspector" id="inspector-bar">
    <div class="inspector-title" style="display: none" id="title">
        Inspector <span id="pos"></span><div id="upload" class="save">UPLOAD</div>
    </div>

    <div class="inspector-list" id="inspector">
        <ul id="list" class="list-container">
        </ul>
    </div>
</div>

<form id="form-level-data">
    <input type="text" id="upload-difficulty" placeholder="level title" required>
    <input type="number" id="upload-title" placeholder="difficulty" required>
    <input type="submit" id="upload-submit" value="Upload!">
</form>

<div id="back-button"></div>
</body>
</html>