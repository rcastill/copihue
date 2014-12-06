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
                        if (data == 1) alert("success!");
                        else alert(data);
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
        var register = false;

        if (user.is(":visible")) {
            // Register
            formData['req'] = 'register';
            formData['username'] = user.val();
            register = true;
        } else {
            formData['req'] = 'login';
        }

        $.ajax({
            url: 'db.php',
            type: 'POST',
            dataType: 'text',
            data: formData,

            success: function (data) {
                if (register) {
                    if (data == 1) console.log("Success!");
                    else alert(data);
                } else {
                    if (isNaN(data)) console.log(data);
                    else alert("level_id " + data);
                }
            },

            error: function (data) {
                alert("Error!");
            }
        });

        return false;
    });
});
