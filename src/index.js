function toggleLoginRegister() {
    var visible = $("#user-input").parent().slideToggle(200, function () {
        if ($(this).is(":visible")) {
            $("#reglog-toggle").html("Login");
            $("#user-input").required = false;
            $("#acc-disc").hide(200);
        } else {
            $("#user-input").required = true;
            $("#reglog-toggle").html("Register");
            $("#acc-disc").show(200);
        }
    });
}

$(document).ready(function () {
    var user = $("#user-input");
    user.parent().hide();
    user.required = false
    $("#email-input").focus();
});