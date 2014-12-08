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

function register($conn=null) {
    if ($conn == null)
        $conn = connect();

    $email = $_POST["email"];

    $seek_query = "SELECT * FROM user WHERE email='$email'";
    $result = $conn->query($seek_query);

    if ($result->num_rows > 0) {
        echo "Email taken";
        return $conn;
    }

    $username = $_POST["username"];

    $via = $_POST["via"];
    $passwd = "";

    if ($via != "facebook") {
        $passwd = md5($_POST["password"]);
    }

    $query = "INSERT INTO user (email, passwd, username, level_id, via) VALUES ('$email', '$passwd', '$username', 5, '$via')";

    if ($conn->query($query))
        echo 0;
    else
        echo $conn->error;

    return $conn;
}

function login($conn=null) {
    // Gets connection
    if ($conn == null)
        $conn = connect();

    // Gets login via
    $via = $_POST["via"];

    /*
     * If via is facebook, we have to verify if is a new connection
     * or a direct login
     */
    if ($via == "facebook") {
        $email = $_POST["email"];
        $query = "SELECT user_id, via FROM user WHERE email='$email'";
        $result = $conn->query($query);

        if ($result->num_rows > 0) {
            // Login
            $row = $result->fetch_assoc();

            if ($row["via"] != "facebook") {
                echo "Not a facebook email";
                return $conn;
            }

            $user_id = $row["user_id"];

            session_start();
            $_SESSION["user_id"] = $user_id;

            echo 1;
        } else {
            // Register
            register($conn);
        }
    } else {
        /*
         * If it is normal via, we have to verify password.
         */
        $email = $_POST["email"];
        $passwd = $_POST["password"];
        $query = "SELECT passwd, via FROM user WHERE email='$email'";

        $result = $conn->query($query);

        if ($result->num_rows > 0) {
            $via = $result->fetch_assoc()["via"];
            $db_pwd = $result->fetch_assoc()["passwd"];

            if ($via != "email") {
                echo "Not registered by email";
                return $conn;
            }

            /*
             * Authenticate
             */
            if (md5($passwd) == $db_pwd) {
                // user exists
                $id_query = "SELECT user_id FROM user WHERE email='$email'";
                $id_result = $conn->query($id_query);
                $user_id = $id_result->fetch_assoc()["user_id"];

                session_start();
                $_SESSION["user_id"] = $user_id;
                echo 1;

            } else {
                echo "Wrong Password";
            }
        } else {
            echo "Wrong email";
        }
    }

    return $conn;
}

$conn = null;

if (isset($_POST)) {
    switch ($_POST["req"]) {
        case "register":
            $conn = register();
            break;

        case "login":
            $conn = login();
            break;
    }
}

if ($conn != null)
    $conn->close();
?>