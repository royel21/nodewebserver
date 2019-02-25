var $popup = $('#popup');

popupHide = (e) => {
    $popup.css({
        display: "none"
    }).text("");
    $popup.removeClass('popup-top');
}

popupShow = async (event) => {
    inEl = true;

    var element = $(event.target).hasClass('popup-msg') ?
        event.target : $(event.target).closest(".popup-msg")[0];

    if (element != undefined) {
        
        var rect = element.getBoundingClientRect();
        var msg = element.dataset.title;
        $popup.css({
            display: "block",
            top: -3000,
        }).text(msg == undefined ? element.textContent : msg);

        var top = rect.top + 8 + rect.height;
        if (top + $popup.height() + 10 > window.innerHeight) {
            top = rect.top - 22 - $popup.height()
            $popup.addClass('popup-top');
        }

        $popup.css({
            top,
            left: (rect.x + rect.width / 2) - ($popup.width() / 2) - 9
        });
    }
}

$('body').on('mouseenter', '.popup-msg', popupShow);
$('body').on('mouseleave wheel click', '.popup-msg', popupHide);