window.local = localStorage;

$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function(elem) {
        return $(elem).text().trim().toUpperCase().includes(arg.trim().toUpperCase());
    };
});

$.expr[":"].textequalto = $.expr.createPseudo(function(arg) {
    return function(elem) {
        return $(elem).text().trim().toUpperCase() === arg.trim().toUpperCase();
    };
});

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    if (value == "undefined") return {};
    return value && JSON.parse(value);
}

Storage.prototype.hasObject = (key) => {
    return local.getObject(key) != null && !$.isEmptyObject(local.getObject(key));
}

Number.prototype.map = function(in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

Array.prototype.removeBy = function(obj, by) {
    var i = this.length;
    while (i--) {
        if (this[i] instanceof Object && this[i][by] === obj[by]) {
            return this.splice(i, 1)[0];
        }
    }
}


const formatTime = (time) => {
    var h = Math.floor(time / 3600);
    var min = Math.floor((time / 3600 - h) * 60);
    var sec = Math.floor(time % 60);
    return (h == 0 ? "" : h + ':') +
        String(min).padStart(2, "0") + ':' + String(sec).padStart(2, "0");
}


var clockTimer;
var $clock = $('.clock');
const startClock = () => {
    $clock.fadeIn();
    $clock.text(new Date().toLocaleTimeString('en-US'));

    clockTimer = setInterval(() => {
        $clock.text(new Date().toLocaleTimeString('en-US'));
    }, 1000);
}

const stopClock = () => {
    $clock.fadeOut();
    clearInterval(clockTimer);
    $clock.text('');
}

var lastEl;

const setfullscreen = (element) => {
    try {
        if (lastEl && element.tagName !== 'BODY') {
            if (document.fullscreenElement.tagName === 'BODY') {
                document.exitFullscreen().then(() => {
                    element.requestFullscreen().catch(err => {});
                }).catch(err => {});
            } else {
                document.exitFullscreen().then(() => {
                    lastEl.requestFullscreen().catch(err => {});
                }).catch(err => {});
            }
        } else {
            if (!document.fullscreenElement) {
                element.requestFullscreen().catch(err => {});
                if (element.tagName === 'BODY') lastEl = element;
                startClock();
            } else {
                document.exitFullscreen().catch(err => {});
                lastEl = null;
                stopClock();
            }
        }

        $('.fa-expand-arrows-alt').attr('data-title', document.webkitIsFullScreen ? "Pantalla Completa" :
            "Salir Pantalla Completa");
    } catch (err) {
        console.log(err)
    }
}