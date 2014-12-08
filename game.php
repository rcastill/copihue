<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>Team Copihue's Game</title>
    <link rel="stylesheet" href="src/landing.css"/>
    <link rel="stylesheet" href="src/hierarchy.css"/>
    <script src="vendor/jquery-2.1.1.min.js"></script>
    <script src="vendor/jquery-ui.min.js"></script>
    <script src="src/util.js"></script>
    <script src="src/hierarchy.js"></script>
    <script src="src/canvas.js"></script>
    <script src="src/levelcase.js"></script>

    <?php
        session_start();
        if (!isset($_SESSION["user_id"]))
            header("location: index.html");
        else {
            include "connect.php";
            $conn = connect();
            $user_id = $_SESSION['user_id'];
            $query   = "SELECT level_id, username FROM user WHERE user_id='$user_id'";
            $res     = $conn->query($query);
            $data    = $res->fetch_assoc();
            echo "<script>var userData = " . json_encode($data) . ";</script>";
            $conn->close();
        }
    ?>

    <script>
    var SAVE_BUTTON = false;

    var currentLevelData;
    var imagesLoaded = false;
    var loaded = false;
    var ids;

    $.ajax({
        dataType: "json",
        url: "http://104.131.173.250/koding/dlevels.php",
        type: 'GET',
        success: function(data) {
            ids = data;
            if(imagesLoaded)
                $('#show-levels').removeClass('loading').text($('#show-levels').attr("data-ready"));
        },

        error: function() {
            console.log("Sorry!, ajax error :(");
        }
    });

    $.ajax({
        dataType: "json",
        url: "http://104.131.173.250/koding/glevel.php?id=" + userData.level_id,
        type: 'GET',
        success: function(data) {
            currentLevelData = data;
            if(imagesLoaded === true)
                $('#resume').removeClass('loading').text($('#resume').attr("data-ready"));
        },

        error: function() {
            console.log("Sorry!, ajax error :(");
        }
    });

    function play(data) {
        $.ajax({
            dataType: "json",
            url: "http://104.131.173.250/koding/set_level.php?id=" + data.id,
            type: 'GET',
            success: function(data) {
                console.log("USER LEVEL UPDATED");
            },

            error: function() {
                console.log("Sorry!, ajax error :(");
            }
        });

        if($('#resume').hasClass('loading'))
            return;

        $('#game-page').css('display', 'block');
        $('#hierarchy').addClass('initialize');

        // initialize components.
        initGame(data.data);
        initHierarchy(data.data.initial);

        // load saved hierarchy.
        if(localStorage['copihue-saveSpace'] != "undefined")
            take(JSON.parse(localStorage['copihue-saveSpace']));

        // display text.
        displayText([
            data.title, 80,
            "Author: " + data.author, 30
        ], 3000);
    }

    $(document).ready(function() {
        $(document).disableSelection();

        loadImages(function() {
            if(currentLevelData != undefined)
                $('#resume').removeClass('loading').text($('#resume').attr("data-ready"));

            if(ids != undefined)
                $('#show-levels').removeClass('loading').text($('#show-levels').attr("data-ready"));

            imagesLoaded = true;
        });

        $('#resume').click(function() {
            play(currentLevelData);
        });

        $('#show-levels').click(function(e) {
            if($(this).hasClass('loading'))
                return;

            $('#levels-showcase').fadeIn();
            e.stopPropagation();

            if(loaded === false) {
                loaded = true;
                for(var i = 0; i < ids.length; i++) {
                    var cont = $('<div id="level_' + ids[i] + '" data-width="400" data-height="264">');
                    cont.attr("data-level", ids[i]);
                    $('#levels-showcase').append(cont);

                    cont.loadLevel(images, function(target) {
                        target.append($('<div class="level-title">' + target.data('level').title + '</div>'));
                    });

                    cont.click(function() {
                        play($(this).data("level"));
                    });
                }
            }
        });

        $('#level-editor').click(function() {
            window.location = "editor.html";
        });

        $('#close-session').click(function() {
            window.location.replace("logout.php");
        });

        $('body').click(function(e) {
            e.stopPropagation();
            $('#levels-showcase').fadeOut();
            $('#context').slideUp();
        });
    });
    </script>
</head>
<body>
<div id="opacity"></div>
<div id="landing-page">
    <h1>TruckScript</h1>
    <div class="big-button loading" id="resume" data-ready="Resume game">Loading...</div>
    <div class="big-button loading" id="show-levels" data-ready="Show levels">Loading...</div>
    <div class="big-button" id="level-editor">Level Editor</div>
    <div class="big-button" id="close-session">Close session</div>
</div>

<div id="game-page">
    <div id="container"></div>
    <div id="hierarchy">
        <h1>Commands</h1>
        <div id="nav-commands">
            <img class="nav-command" id="command-go" src="img/go.png" alt="Go">
            <img class="nav-command" id="command-right" src="img/right.png" alt="Turn Right">
            <img class="nav-command" id="command-left" src="img/left.png" alt="Turn Left">
            <img class="nav-command" id="command-mark" src="img/mark.png" alt="Mark">
            <img class="nav-command" id="command-signal" src="img/signal.png" alt="Signal" />
        </div>
        <h1>Hierarchy</h1>
        <div id="trucks"></div>
        <div id="plus-button"><img src="img/plus-button.png"></div>
        <div id="action-bar">
            <div id="save-button"></div>
            <div id="play-button"></div>
            <div id="back-button"></div>
        </div>
    </div>

    <div id="context">
        <a href="#" id="context-delete">delete</a>
        <a href="#" id="context-lock">lock / unlock</a>
    </div>
</div>

<div id="levels-showcase">
    <div class="back-cover"></div>
</div>
<div id="display-container"></div>
<img src="img/back-button-hover.png" style="display: none;" />
</body>
</html>