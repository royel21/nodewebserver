var volcontrol = document.getElementById('v-vol-control');
var btnPlay = document.getElementById('v-play');
var btnMuted = document.getElementById('v-mute');
var player = document.getElementById('player');
const videoViewer = document.getElementById('video-viewer');
var $vTotalTime = $('#v-total-time');
var totalTime;
var fileN = 0;
var hour = false;
var vDuration;
var Slider = null;
var update = false;

$('.btn-fullscr').click((e) => {
    setfullscreen(videoViewer)
});

if (local.hasObject('config')) {
    var oldConfig = local.getObject('config');
    for (var key in config) {
        if (oldConfig[key] == undefined) {
            oldConfig[key] = config[key];
        }
    }
    config = oldConfig;
}

Slider = new SliderRange('#slider-container');

Slider.min = 0;
Slider.value = 0;
Slider.max = 1;
Slider.setPreviewContent($('<span id="v-current-time">'))
Slider.onPreview = (value) => {
    $('#v-current-time').text(formatTime(Math.floor(value)));
}

const configPlayer = () => {
    vDuration = formatTime(player.duration);
    $vTotalTime.text(formatTime(player.currentTime) + "/" + vDuration);

    player.volume = config.volume;

    player.muted = btnMuted.checked = config.isMuted;
    player.currentTime = currentFile.pos || 0;
    if (!config.paused) pauseOrPlay();
    $('.loading').css({ display: 'none' });

    update = true;
}

player.onloadedmetadata = function (e) {
    Slider.min = 0;
    Slider.max = player.duration;
    Slider.value = 0;
    configPlayer();
}

player.onerror = (err) =>{
    console.log(err);
}

player.addEventListener("contextmenu", (e) =>{
    e.preventDefault();
});

volcontrol.value = config.volume;
$('#video-viewer .fa-volume-up').attr('data-title', config.isMuted ? "Unmute" : "Mute");

Slider.oninput = (value) => {
    player.currentTime = value;
}

const closePlayer = (e) => {
    socket.emit('add-or-update-recent', currentFile);

    if (document.fullscreenElement && !document.fullscreenElement.tagName.includes('BODY')) {
        setfullscreen(videoViewer);
    }

    $('#video-viewer').fadeOut('fast', (e) => {
        selectItem(selectedIndex);
        currentFile = {};
        player.pause();
        player.src = "";
    });
}

$('#hide-player').click(closePlayer);

const pauseOrPlay = () => {
    var playPause = "Pausar";
    if (player.paused) {
        player.play().catch(e => { });
        $('#video-name').fadeOut('slow');
        $clock.removeClass('d-none');
        $('#v-total-time').removeClass('d-none');
    } else {
        player.pause();
        playPause = "Reproducir";
        $('#video-name').fadeIn('slow');
        $clock.addClass('d-none');
        $('#v-total-time').addClass('d-none');

    }
    $('#video-viewer .fa-play-circle').attr('data-title', playPause);
    btnPlay.checked = config.paused = player.paused;
}

volcontrol.oninput = (e) => {
    player.volume = volcontrol.value;
}

btnPlay.onchange = pauseOrPlay;

btnMuted.onchange = () => {
    player.muted = btnMuted.checked;
    config.isMuted = btnMuted.checked;
    $('#video-viewer .fa-volume-up').attr('data-title', btnMuted.checked ? "No Silenciar" : "Silenciar");
}
// deltaY obviously records vertical scroll, deltaX and deltaZ exist too
mediaContainer.onwheel = (event) => {
    if (event.deltaY < 0) {
        volcontrol.value = player.volume + 0.05;
        player.volume = volcontrol.value;
    } else {
        volcontrol.value -= 0.05;
        player.volume = volcontrol.value;
    }
};

var mouseTimer = null;

showCursor = () => {
    $('.footer').removeClass('hide-footer');
    $(document.body).css({
        cursor: "default"
    });
    window.clearTimeout(mouseTimer);
    mouseTimer = null;
}

hideFooter = () => {
    showCursor();
    if (document.fullscreenElement) {
        mouseTimer = window.setTimeout(() => {

            if (player.paused) {
                elClass = "";
                $(document.body).css({
                    cursor: "default"
                });
            } else {

                $('.footer').addClass("hide-footer");
                $(document.body).css({
                    cursor: "none"
                });
            }
        }, config.hidecontrolduration * 1000);
    }
}

document.onfullscreenchange = (e) => {
    if (document.fullscreenElement) {
        $(document).on('mousemove', hideFooter);
        hideFooter();
    } else {
        $(document).off('mousemove', hideFooter);
        showCursor();
    }
}

player.ondblclick = (e) => setfullscreen(videoViewer);
player.onplay = player.onpause = hideFooter;

player.ontimeupdate = (e) => {
    if (update && Slider) {
        Slider.value = Math.floor(player.currentTime);
        let current = formatTime(player.currentTime) + "/" + vDuration;
        $vTotalTime.text( current);
        $('#'+currentFile.id+" .item-progress").text(current);
        currentFile.pos = player.currentTime;
    }
}

var volTimer = null;
player.onvolumechange = function (e) {
    if (update) {
        config.volume = player.volume;
        if ($('.footer').hasClass('hide-footer') && document.fullscreenElement) {
            $('.v-vol').addClass('vol-show');
            clearTimeout(volTimer);
            volTimer = setTimeout(() => {
                $('.v-vol').removeClass('vol-show');
                clearTimeout(volTimer);
                volTimer = null;
            }, 1500);
        }
        volcontrol.value = player.volume;
        volcontrol.setAttribute('value', player.volume);
    }
}

var pressStart, detectTap = false;
var point = { X: 0, Y: 0 };

player.ontouchstart = player.onmousedown = (e) => {
    e.preventDefault();
    detectTap = true;
    pressStart = new Date();
    if (e.type.includes('touch')) {
        point.X = e.touches[0].clientX;
        point.Y = e.touches[0].clientY;
    }
}

player.ontouchend = player.ontouchcancel = player.onmouseup = player.onpointercancel = (e) => {
    e.preventDefault();
    detectTap = false;
    if ((new Date() - pressStart) < 200) {
        pauseOrPlay();
    }
}

player.ontouchmove = (e) => {
    e.preventDefault();
    let touch = e.touches[0];
    if (detectTap) {
        let offset = 2;
        let diffY = touch.clientY - point.Y;
        if (diffY < -offset) {
            volcontrol.value = player.volume + 0.05;
            player.volume = volcontrol.value;
        }

        if (diffY > offset) {
            volcontrol.value -= 0.05;
            player.volume = volcontrol.value;
        }
        let diffX = touch.clientX - point.X;
        if (diffX > offset) {
            player.currentTime += 2;
        }

        if (diffX < -offset) {
            player.currentTime -= 2;
        }
        point.X = touch.clientX;
        point.Y = touch.clientY;
    }
}

videoViewer.style.left = "34%";
videoViewer.style.top = "20%";

// Test
player.onended = function () {

    if (fileN < filesList.length - 1) {
        var waitEnd = setTimeout(() => {
            if (player.ended)
                // processFile(filesList[++fileN].Name);
                clearTimeout(waitEnd);
        }, 3000)
    }
}
var err2;

const playVideo = (el) => {
    if (el) {

        update = false;
        if(currentFile.id !== el.id){
            socket.emit('add-or-update-recent', currentFile);
        }
        currentFile.id = el.id;

       $(videoViewer).fadeIn(()=>{ videoViewer.focus(); });

        $('.loading').css({ display: 'flex' });

        $('#video-name').text($(el.querySelector('.item-name')).text());
        player.src = "/videoplayer/video/" + currentFile.id;
        selectedIndex = $('.items').index(el);
        player.play().catch(err=>{
            if(err.code === 9){
                $('.loading-title').text('File Not Found Contat Admin');
            }
        });
    }
}


$("#video-viewer .fa-arrow-alt-circle-right").click((e) => {
    let next = $('#' + currentFile.id).next()[0];
    if (next) {
        processFile(next)
    }
});

$("#video-viewer .fa-arrow-alt-circle-left").click((e) => {
    let prev = $('#' + currentFile.id).prev()[0];
    if (prev) {
        processFile(prev);
    }
});

var playerKeyDown = (e) => {
    if ($(videoViewer).is(':visible')) {
        var keys = config.playerkey;
        switch (e.keyCode) {
            case keys.fullscreen.keycode:
                {
                    if (e.ctrlKey == keys.fullscreen.isctrl)
                        setfullscreen(videoViewer);
                    break;
                }
            case keys.playpause.keycode:
                {
                    if (e.ctrlKey == keys.playpause.isctrl)
                        pauseOrPlay();
                    break;
                }
            case keys.rewind.keycode:
                {
                    if (e.ctrlKey == keys.rewind.isctrl)
                        player.currentTime -= 6;
                    break;
                }
            case keys.volumeup.keycode:
                {
                    if (e.ctrlKey == keys.volumeup.isctrl) {
                        volcontrol.value = player.volume + 0.05;
                        player.volume = volcontrol.value;
                    }
                    break;
                }
            case keys.forward.keycode:
                {
                    if (e.ctrlKey == keys.forward.isctrl)
                        player.currentTime += 6;
                    break;
                }
            case keys.volumedown.keycode:
                {
                    if (e.ctrlKey == keys.volumedown.isctrl) {
                        volcontrol.value -= Number(0.05);
                        player.volume = volcontrol.value;
                    }
                    break;
                }
            case keys.volumemute.keycode:
                {
                    if (e.ctrlKey == keys.volumemute.isctrl) {
                        player.muted = btnMuted.checked;
                        config.isMuted = btnMuted.checked;
                        $('.fa-volume-up').attr('data-title', btnMuted.checked ? "Unmute" : "Mute");
                    }
                    break;
                }
            case keys.nextfile.keycode:
                {
                    if (e.ctrlKey == keys.nextfile.isctrl) {
                        let next = $('#' + currentFile.id).next()[0];
                        if (next) {
                            playVideo(next)
                        }
                    }
                    break;
                }
            case keys.previousfile.keycode:
                {
                    if (e.ctrlKey == keys.previousfile.isctrl) {
                        let prev = $('#' + currentFile.id).prev()[0];
                        if (prev) {
                            playVideo(prev);
                        }
                        break;
                    }
                }
            case keys.closeplayer.keycode:
                {
                    if (e.ctrlKey == keys.closeplayer.isctrl) {
                        closePlayer(e);
                    }
                    break;
                }
        }
        e.stopPropagation();
        e.preventDefault();
    }
}
$(document).on('webkitfullscreenchange fullscreenchange', function (e) {

    if (!$(videoViewer).hasClass('d-none')) {
        if (document.fullscreenElement === videoViewer && isAndroid) {
            screen.orientation.lock('landscape');
        } else {
            screen.orientation.unlock();
        }
    }
});
