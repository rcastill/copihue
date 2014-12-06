function handleLoginState(cases) {
    FB.getLoginStatus(
        function (response) {
            if (response.status === 'connected') {
                if (cases.connected != 'undefined') cases.connected(response);
                else console.log("NoCallbackForConnected");
            } else if (response.standby === 'not_authorized') {
                if (cases.nauth != 'undefined') cases.nauth(response);
                else console.log("NoCallbackForNotAuthorized");
            } else {
                if (cases.neither != 'undefined') cases.neither(response);
                else console.log("NoCallbackForNeither");
            }
        }
    );
}

function login() {
    handleLoginState({
        connected: function (response) {
            alert("Connected");
        },

        nauth: function (response) {
            alert("Not authorized :(");
        },

        neither: function (response) {
            alert("Neither");
        }
    });
}

function disconnect() {
    handleLoginState({
        connected: function (response) {
            FB.logout(function (response) {
                alert("Disconnected");
            });
        },

        neither: function (response) {
            alert("Never connected");
        }
    });
}

function getData() {
    handleLoginState({
        connected: function (response) {
            FB.api("/me", function (response) {
                $("#user-data").html(response.name + "(" + response.email + ")");
            })
        }
    });
}

window.fbAsyncInit = function() {
    FB.init({
        appId      : '565846393559708',
        xfbml      : true,
        version    : 'v2.2'
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));