var volcontrol = document.getElementById('v-vol-control');
var btnPlay = document.getElementById('v-play');
var btnMuted = document.getElementById('v-mute');
var player = document.getElementById('player');
const videoViewer = document.getElementById('video-viewer');
const vContainer = document.getElementById('video-container');
var $vTotalTime = $('#v-total-time');
var totalTime;
var fileN = 0;
var hour = false;
var vDuration;
var Slider = null;
var update = false;
var currentVideoId = "";

let currentFile = { id: 0, currentTime: 0 };

$('.btn-fullscr').click((e) => { 
    setfullscreen(videoViewer) 
});

var config = {
    sortBy: "Name-D",
    volume: 0,
    isMuted: false,
    paused: true,
    hidecontrolduration: 2,
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

window.onbeforeunload = (e) => {
    if (config) {
        local.setObject('config', config);
    }
}

if (local.hasObject('config')) {
    var oldConfig = local.getObject('config');
    for (var key in config) {
        if (oldConfig[key] == undefined) {
            oldConfig[key] = config[key];
        }
    }
    config = oldConfig;
}

const configPlayer = () => {
    vDuration = formatTime(player.duration);
    $vTotalTime.text(formatTime(player.currentTime) + "/" + vDuration);

    player.volume = config.volume;

    player.muted = btnMuted.checked = config.isMuted;

    if (!config.paused) pauseOrPlay();

    update = true;
}

player.onloadedmetadata = function (e) {
    Slider.min = 0;
    Slider.max = player.duration;
    Slider.value = 0;
    configPlayer();
    console.log("Duration", vDuration);
}

volcontrol.value = config.volume;
$('.fa-volume-up').attr('data-title', config.isMuted ? "Unmute" : "Mute");

Slider = new SliderRange('#slider-container');
Slider.oninput = (value) => {
    console.log("slider Val: " + value)
    player.currentTime = value;
}

vContainer.addEventListener('keydown', function (e) {
    console.log(e.keyCode);
});

vContainer.onkeydown = (e) => {
    var keys = config.playerkey;
    console.log(e.keyCode);
    switch (e.keyCode) {
        case keys.fullscreen.keycode:
            {
                if (e.ctrlKey == keys.fullscreen.isctrl)
                    setfullscreen(videoViewer)
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
    e.stopPropagation();
    e.preventDefault();
    console.log(e.target)
}

const pauseOrPlay = () => {
    var playPause = "Pausar";
    if (player.paused) {
        player.play().catch(e => { });
    } else {
        player.pause();
        playPause = "Reproducir";
    }
    $('.fa-play-circle').attr('data-title', playPause);
    btnPlay.checked = config.paused = player.paused;
}

volcontrol.oninput = (e) => {
    player.volume = volcontrol.value;
}

btnPlay.onchange = pauseOrPlay;

btnMuted.onchange = () => {
    player.muted = btnMuted.checked;
    config.isMuted = btnMuted.checked;
    $('.fa-volume-up').attr('data-title', btnMuted.checked ? "No Silenciar" : "Silenciar");
}

vContainer.onwheel = (event) => {
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

                $('.footer').addClass("hide-footer");
                $(document.body).css({
                    cursor: "none"
                });
            }

        }, config.hidecontrolduration * 1000);
    }
}


$(player).on('webkitfullscreenchange', (e) => {
    if (document.webkitIsFullScreen) {
        console.log("hide Cursor")
        $(document).on('mousemove', hideFooter);
        hideFooter();
    } else {
        $(document).off('mousemove', hideFooter);
        showCursor();
    }
});


player.ondblclick = (e) => setfullscreen(vcontainer);
player.onplay = player.onpause = hideFooter;

player.ontimeupdate = (e) => {
    if (update && Slider) {
        Slider.value = Math.floor(player.currentTime);
        $vTotalTime.text(formatTime(player.currentTime) + "/" + vDuration);
    }
}

var volTimer = null;
player.onvolumechange = function (e) {
    if (update) {
        config.volume = player.volume;
        if ($('.footer').hasClass('hide-footer') && document.webkitIsFullScreen) {
            $('.v-vol').addClass('vol-show');

            volTimer = setTimeout(() => {
                $('.v-vol').removeClass('vol-show');
                clearTimeout(volTimer);
                volTimer = null;
            }, 1500);
        }
        volcontrol.value = player.volume;
        volcontrol.setAttribute('value', player.volume)
        console.log("onVolChange", player.volume)
    }
}

var pressStart, detectTap = false;
var point = { X: 0, Y: 0 };
player.onpointerdown = (e) => {
    e.preventDefault();
    detectTap = true;
    pressStart = new Date();
    point.X = e.clientX;
    point.Y = e.clientY;
}

player.onpointerup = player.onpointercancel = (e) => {
    e.preventDefault();
    detectTap = false;
    if ((new Date() - pressStart) < 200) {
        pauseOrPlay();
    }
}

player.onpointermove = (e) => {
    e.preventDefault();
    if (detectTap) {
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

videoViewer.style.left = "34%";
videoViewer.style.top = "29%";

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

$('#hide-player').click((e) => {
    player.pause();
    $('#video-viewer').fadeOut('fast', (e) => {
        $('#video-container').css({ display: 'none' });
    });
});

const playVideo = (el) => {
    if(el){
        let id = el.id;
        currentVideoId = id;
        vContainer.style.display = "block";
        player.src = "/videoplayer/video/" + id;
        $(videoViewer).fadeIn('fast');
        vContainer.focus();
    }
    
}

$('body').on('click', '.fa-play-circle', (e)=>{ 
    console.log(e.target)
    playVideo(e.target.closest('.items')); 
});

$(".fa-arrow-alt-circle-right").click((e)=>{
    let next = $('#'+currentVideoId).next()[0];
    if(next){
        playVideo(next)
    }
});

$(".fa-arrow-alt-circle-left").click((e)=>{
    let prev = $('#'+currentVideoId).prev()[0];
    if(prev){
        playVideo(prev);
    }
});

window.addEventListener("orientationchange", function(e) {
    console.log(screen.orientation.angle);
    if($(videoViewer).is(":visible")){
        if( screen.orientation.angle > 0 && !document.fullscreenElement)
        {
            setfullscreen(videoViewer);
        }
     }
});