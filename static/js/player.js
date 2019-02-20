var volcontrol = document.getElementById('v-vol-control');
var btnPlay = document.getElementById('v-play');
var btnMuted = document.getElementById('v-mute');
var player = document.getElementById('player');
var $vTotalTime = $('#v-total-time');
var totalTime;
var fileN = 0;
var hour = false;
var vDuration;
var Slider = null;
var update = false;

document.getElementsByClassName('btn-fullscr')[0].onclick = setfullscreen;

var config = {
    recents: [],
    recentMax: 50,
    favId: 1,
    sortBy: "Name-D",
    volume: 0,
    isMuted: false,
    paused: true,
    hidecontrolduration: 1,
    playerkey: {
        nextfile: {
            name: "PageDown",
            keycode: 34,
            isctrl: false
        },
        previousfile: {
            name: "PageDown",
            keycode: 33,
            isctrl: false
        },
        forward: {
            name: "ArrowRight",
            keycode: 39,
            isctrl: false
        },
        rewind: {
            name: "ArrowLeft",
            keycode: 37,
            isctrl: false
        },
        playpause: {
            name: "Space",
            keycode: 32,
            isctrl: false
        },
        fullscreen: {
            name: "Enter",
            keycode: 13,
            isctrl: false
        },
        volumeup: {
            name: "ArrowUp",
            keycode: 38,
            isctrl: false
        },
        volumedown: {
            name: "ArrowDown",
            keycode: 40,
            isctrl: false
        },
        volumemute: {
            name: "m",
            keycode: 77,
            isctrl: false
        }
    }
}

player.onloadedmetadata = function (e) {
    Slider.min = 0;
    Slider.max = player.duration;
    Slider.value = 0;
    vDuration = formatTime(player.duration);
    update = true;
    btnMuted.checked = true;
    player.muted = btnMuted.checked;
    //config.isMuted = btnMuted.checked;
    $('.fa-volume-up').attr('data-title', btnMuted.checked ? "Unmute" : "Mute");
    console.log(player.muted);
    proccessTouch(player);
}

Slider = new SliderRange('#slider-container');
Slider.oninput = (value) => {
    player.currentTime = value;
}

$(player).dblclick((e) => {
    setfullscreen();
});

player.ontimeupdate = (e) => {
    if (update && Slider) {
        Slider.value = Math.floor(player.currentTime);
        $vTotalTime.text(formatTime(player.currentTime) + "/" + vDuration)
    }
}

player.onended = function () {
    if (fileN < filesList.length - 1) {
        var waitEnd = setTimeout(() => {
            if (player.ended)
                // processFile(filesList[++fileN].Name);
                clearTimeout(waitEnd);
        }, 3000)
    } else {
        // returnToFb();
    }
}

document.onkeydown = (e) => {
    var keys = config.playerkey;
    switch (e.keyCode) {
        case keys.fullscreen.keycode:
            {
                if (e.ctrlKey == keys.fullscreen.isctrl)
                    setfullscreen();
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
                    if (fileN < filesList.length - 1) {
                        // processFile(filesList[++fileN].Name);
                    } else {
                        // returnToFb();
                    }
                }
                break;
            }
        case keys.previousfile.keycode:
            {
                if (e.ctrlKey == keys.previousfile.isctrl) {
                    if (fileN > 0) {
                        //processFile(filesList[--fileN].Name);
                    } else {
                        // returnToFb();
                    }
                }
                break;
            }
    }
}

pauseOrPlay = () => {
    var playPause = "Play";
    if (player.paused) {
        player.play().catch(e => { });
    } else {
        player.pause();
        playPause = "Pause";
    }
    $('.fa-play-circle').attr('data-title', playPause);
    // btnPlay.checked = config.paused = player.paused;

}
var pressStart;
$(player).mousedown((e) => {
    if (e.which == 1) {
        pressStart = new Date();
    }
});

$(player).mouseup((e) => {
    if (e.which == 1) {
        pressStart = new Date();
    }
});

// $(player).click((e) => {
//     if (e.which == 1) {
//         pauseOrPlay();
//     }
// });

volcontrol.oninput = (e) => {
    player.volume = volcontrol.value;
}

//player.onplay = player.onpause = hideFooter;


btnPlay.onchange = pauseOrPlay;

btnMuted.onchange = () => {
    player.muted = btnMuted.checked;
    //config.isMuted = btnMuted.checked;
    $('.fa-volume-up').attr('data-title', btnMuted.checked ? "Unmute" : "Mute");
}

var volTimer = null;

player.onvolumechange = function (e) {
    //config.volume = player.volume;
    if ($('.footer').hasClass('hide-footer') && document.webkitIsFullScreen) {
        $('.v-vol').addClass('vol-show');

        if (volTimer) clearTimeout(volTimer);

        volTimer = setTimeout(() => {
            $('.v-vol').removeClass('vol-show');
            volTimer = null;
        }, 1000);
    }
    volcontrol.setAttribute("value", player.volume);
}

document.onwheel = (event) => {
    // deltaY obviously records vertical scroll, deltaX and deltaZ exist too
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
    if (document.webkitIsFullScreen) {
        mouseTimer = window.setTimeout(() => {

            if (player.paused) {
                elClass = "";
                $(document.body).css({
                    cursor: "default"
                });
            } else {
                // $('.v-vol').addClass('vol-show');
                $('.footer').addClass("hide-footer");
                $(document.body).css({
                    cursor: "none"
                });
            }

        }, config.hidecontrolduration * 1000);
    }
}

$(document).on('webkitfullscreenchange', (e) => {
    if (document.webkitIsFullScreen) {
        console.log("hide Cursor")
        $(document).on('mousemove', hideFooter);
        hideFooter();
    } else {
        $(document).off('mousemove', hideFooter);
        showCursor();
    }
});

$('#v-exit-to-fb').click((e) => {
    window.history.back();
});

var proccessTouch = (player) => {
    var pressStart, detectTap = false;
    var point = { X: 0, Y: 0 };
    $(player).on('pointerdown', function (e) {
        e.preventDefault();
        detectTap = true;
        pressStart = new Date();
        point.X = e.clientX;
        point.Y = e.clientY;
    });

    $(player).on('pointerup pointercancel', (e) => {
        e.preventDefault();
        detectTap = false;
    });

    $(player).on('pointermove', function (e) {
        e.preventDefault();
        if (detectTap) {
            if ((new Date() - pressStart) < 200) {
                pauseOrPlay();
                console.log("playorPause");
            } else {
                let offset = 2;
                let diffY = e.clientY - point.Y;
                if (diffY < -offset) {
                    console.log("Up: " + diffY);
                    volcontrol.value = player.volume + 0.05;
                    player.volume = volcontrol.value;
                }

                if (diffY > offset) {
                    console.log("Down: " + (e.clientY - point.Y));
                    volcontrol.value -= 0.05;
                    player.volume = volcontrol.value;
                }
                let diffX = e.clientX - point.X;
                if (diffX > offset) {
                    console.log("right: " + diffX);
                    player.currentTime += 2;
                }

                if (diffX < -offset) {
                    console.log("letf: " + (e.clientX - point.X));
                    player.currentTime -= 2;
                }
                point.X = e.clientX;
                point.Y = e.clientY;
            }
        }
    });
}