var modal = null;
var offset = {
    x: 0,
    y: 0,
    w: 0,
    h: 0
};
var isPressed = false;
var zindex = 100;

$('body').on('mousedown', '.move', (e) => {
    if ($(e.target).hasClass('move')) {
        modal = $(e.target).closest('.move-modal')[0];
        offset.x = e.clientX - modal.offsetLeft;
        offset.y = e.clientY - modal.offsetTop;
        offset.w = $(modal).width();
        offset.h = $(modal).height();
        isPressed = true;
        zindex++;
        $(modal).css({
            zIndex: zindex
        });
    }
});

function moveEl(el, left, top, w, h) {
    if (left < 0) {
        left = 1;
    }

    if (left + w + 3 > $(window).width()) {
        left = $(window).width() - w - 3;
    }

    if (top < 1) {
        top = 1;
    }

    if ((top + h + 5) > $(window).height()) {
        top = $(window).height() - h - 5;
    }
    el.style.left = left + 'px';
    el.style.top = top + 'px';
}

$(document).mousemove((me) => {
    if (isPressed) {
        var left = (me.clientX - offset.x);
        var top = (me.clientY - offset.y);
        moveEl(modal, left, top, offset.w, offset.h)
    }
});

$(document).mouseup((e) => {
    isPressed = false;
});

$(()=>{

    $(window).on('resize webkitfullscreenchange', (e) => {
        $('.move').each((index, el) => {
            if ($(el).closest('.move-modal').css('visibility') == "visible") {
                modal = $(el).closest('.modal')[0];
                if(modal){
                    moveEl(modal, modal.offsetLeft, modal.offsetTop, $(modal).width(), $(modal).height());
                    modal = null; 
                }
            }
        });
    });

});


var resizeEl;

$('body').on('mousedown', '.resize', (e) => {
    if (e.target.classList.value.includes('resize'))
        resizeEl = e.target;
});

$(document).mousemove((e) => {
    if (resizeEl != undefined) {
        var x = e.clientX - resizeEl.offsetLeft;
        var y = e.clientY - resizeEl.offsetTop;
        if (x < $(window).width() - resizeEl.offsetLeft) {
            resizeEl.style.width = x + "px";
        }
        
        if (y < $(window).height() - resizeEl.offsetTop-5) {
            resizeEl.style.height = y + "px";
        }
    }
});

$(document).mouseup((e) => { resizeEl = undefined });