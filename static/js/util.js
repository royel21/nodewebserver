window.local = localStorage;

$.expr[":"].contains = $.expr.createPseudo(function (arg) {
    return function (elem) {
        return $(elem).text().trim().toUpperCase().includes(arg.trim().toUpperCase());
    };
});

$.expr[":"].textequalto = $.expr.createPseudo(function (arg) {
    return function (elem) {
        return $(elem).text().trim().toUpperCase() === arg.trim().toUpperCase();
    };
});

Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function (key) {
    var value = this.getItem(key);
    if (value == "undefined") return {};
    return value && JSON.parse(value);
}

Storage.prototype.hasObject = (key) => {
    return local.getObject(key) != null && !$.isEmptyObject(local.getObject(key));
}

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

Array.prototype.removeBy = function (obj, by) {
    var i = this.length;
    while (i--) {
        if (this[i] instanceof Object && this[i][by] === obj[by]) {
            return this.splice(i, 1)[0];
        }
    }
}

formatTime = (time) => {
    var h = Math.floor(time / 3600);
    var min = Math.floor((time / 3600 - h) * 60);
    var sec = Math.floor(time % 60);
    return (h == 0 ? "" : String(h).padStart(2, "0") + ':') +
        String(min).padStart(2, "0") + ':' + String(sec).padStart(2, "0");
}

setfullscreen = (element) => {
    try {
        if (!document.fullscreenElement) {
            element.requestFullscreen().catch(err => { });
        } else {
            document.exitFullscreen().catch(err => { });
        }
        $('.fa-expand-arrows-alt').attr('data-title', document.webkitIsFullScreen ? "Pantalla Completa" : "Salir Pantalla Completa");
    } catch (err) {

    }
}