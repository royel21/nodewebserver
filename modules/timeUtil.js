module.exports.formatTime = (time) => {
    var h = Math.floor(time / 3600);
    var min = Math.floor((time / 3600 - h) * 60);
    var sec = Math.floor(time % 60);
    return (h == 0 ? "" : h + ':') + String(min).padStart(2, "0") + ':' + String(sec).padStart(2, "0");
}