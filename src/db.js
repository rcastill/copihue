function getTest() {
    var user = $("#user-input").val();

    $.ajax({
        url: "db.php",
        type: "POST",
        data: {'username': user, 'passwd': $("#pwd-input").val(), 'email': user + "@example.com"},
        success: function (data) {
            $("#test-btn").html(data);
        }

    });
}

function registerViaEmail() {
    //register
}

function loginViaEmail() {

}

function registerViaFacebook() {
    handleLoginState({
        connected: function (response) {
            FB.api("/me", function (response) {
                $.ajax({
                    url: 'db.php',
                    type: 'POST',
                    dataType: 'text',
                    data: {
                        'username': response.name,
                        'email': response.email
                    },

                    success: function (data) {
                        if (data == 1) alert("success!");
                        else alert("there was a problem with your request...");
                    },

                    error: function (data) {
                        alert("error");
                    }
                });
            });
        },

        nauth: function (response) {
            alert("Need auth");
        },

        neither: function (response) {
            alert("Register");
        }
    });
}

function loginViaFacebook() {

}