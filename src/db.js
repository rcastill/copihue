function registerViaFacebook() {
    handleLoginState({
        connected: function (response) {
            FB.api("/me", function (response) {
                $.ajax({
                    url: 'db.php',
                    type: 'POST',
                    dataType: 'text',
                    data: {
                        'req': 'login',
                        'via':'facebook',
                        'username': response.name,
                        'email': response.email
                    },

                    success: function (data) {
                        if (isNaN(data)) alert(data);

                        else if (data == 0)
                            alert("registred!");

                        else if (data == 1)
                            window.location.replace("game.php");

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

$(document).ready(function () {
    $("#user-form").submit(function (event) {
        var formData = {
            'via': 'email',
            'email': $("#email-input").val(),
            'password': $("#pwd-input").val()
        };

        var user = $("#user-input");

        if (user.is(":visible")) {
            // Register
            formData['req'] = 'register';
            formData['username'] = user.val();
        } else {
            formData['req'] = 'login';
        }

        $.ajax({
            url: 'db.php',
            type: 'POST',
            dataType: 'text',
            data: formData,

            success: function (data) {
                if (isNaN(data)) alert(data);

                // register
                else if (data == 0)
                    alert("Success");

                // login
                else if (data == 1)
                    window.location.replace("game.php");
            },

            error: function (data) {
                alert("Error!");
            }
        });

        return false;
    });
});
