/* global moment $ */
$(document).ready(function() {
    var $generated;

    $(".collapse").on("hide.bs.collapse", function(e) {
        e.stopPropagation();
        $(this).prev().removeClass("open");
    }).on("show.bs.collapse", function(e) {
        e.stopPropagation();
        $(this).prev().addClass("open");
    });

    $("a.toggle").on("click", function() {
        if ($(this).text() === "Screenshot -") {
            $(this).text("Screenshot +");
            $(this).siblings("a.screenshot").find("img").hide();
        }
        else {
            $(this).text("Screenshot -");
            $(this).siblings("a.screenshot").find("img").show();
        }
    });
    $generated = $(".generated-on");

    $generated.text("Generated " + moment($generated.text()).fromNow());
});
