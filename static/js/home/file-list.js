const contentScroll = document.getElementById('content');
const mediaContainer = document.getElementById('media-container');
const calCol = () => colNum = Math.floor((window.innerWidth - 15) / ($('.items').eq(0).width()));

var page = 1;
var selectedIndex = local.getItem('selectedIndex') || 0;
var totalPage = 0;
var currentPage = 1;

const UP = 38;
const DOWN = 40;
const LEFT = 37;
const RIGHT = 39;
const ENTER = 13;


let currentFile = { id: 0, currentPos: 0 };

var config = {
    sortBy: "Name-D",
    serie: { lastSerie: "", lastIndex: 0 },
    volume: 0,
    isMuted: false,
    paused: true,
    hidecontrolduration: 3,
    recentVideoMax: 100,
    recentVideos: [],
    itemsPerPage: 0,
    seriesPerPage: 0,
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
        },
        closeplayer: {
            name: "x",
            keycode: 88,
            isctrl: true
        }
    }
}

const selectItem = async (index) => {
    selectedIndex = index;
    var nextEl = $('.items').get(index);
    var tout = setTimeout(() => {
        if (nextEl != undefined) {
            var scroll = contentScroll.scrollTop,
                elofft = nextEl.offsetTop;

            if (elofft - scroll + 1 < -1) {
                scroll = elofft;
            }

            var top = elofft + nextEl.offsetHeight;
            var sctop = scroll + contentScroll.offsetHeight;
            if (top - sctop + 1 > 0) {
                scroll = scroll + (top - sctop);
            }
            contentScroll.scroll({
                top: scroll,
                behavior: 'auto'
            });
            $(nextEl).focus();
        }
        clearTimeout(tout);
    });
    return nextEl;
}

const calPages = () => {
    currentPage = parseInt($('#pager .active').text()) || 1;
    totalPage = Math.ceil(parseInt($('.badge').text()) / parseInt($('#item').val())) || 1;
}

processFile = (item) => {
    
    if (item.dataset.type.includes("Video")) {
        $('#manga-viewer').addClass('d-none');
        $('#video-viewer').removeClass('d-none');
        playVideo(item);
    } else {
        $('#manga-viewer').removeClass('d-none');
        $('#video-viewer').addClass('d-none');
        openManga(item);
    }
    mediaContainer.focus();
}

$('body').on('click', '.items .fa-play-circle', (e) => {
    processFile(e.target.closest('.items'));
});

$('body').on('keydown', '.items-list', (e) => {
    calCol();
    calPages();

    let totalitem = $('.items').length;
    let title = document.title;
    var wasProcesed = false;
    switch (e.keyCode) {
        case ENTER:
            {
                let item = e.target.closest('.items')
                if (item.dataset.type) {
                    processFile(item);
                } else {
                    let url = "/serie-content/" + item.id;
                    window.history.pushState(title, title, url);
                    lastIndex = selectedIndex;
                    local.setItem('serie', item.id);
                    config.serie.SerieIndex = selectedIndex;
                    loadPartialPage(url, () => {
                        selectItem(0);
                    });
                }
                wasProcesed = true;
                break;
            }
        case LEFT:
            {

                if (e.ctrlKey && currentPage > 1) {

                    let url = $('#pager .active').prev().find('a').attr('href');
                    window.history.pushState(title, title, url);
                    loadPartialPage(url, () => {
                        selectItem($('.items').length - 1);
                    });
                }
                else if (selectedIndex > 0) {
                    selectItem(selectedIndex - 1);
                }
                wasProcesed = true;
                break;
            }
        case UP:
            {
                if (e.ctrlKey) {
                    goBack();
                } else
                    if (selectedIndex - colNum >= 0) {
                        selectItem(selectedIndex - colNum);
                    }
                wasProcesed = true;
                break;
            }
        case RIGHT:
            {

                if (e.ctrlKey && currentPage < totalPage) {

                    let url = $('#pager .active').next().find('a').attr('href');
                    window.history.pushState(title, title, url);
                    loadPartialPage(url, () => {
                        selectItem(0);
                    });
                }
                else if (selectedIndex < totalitem - 1) {
                    selectItem(selectedIndex + 1);
                }
                wasProcesed = true;
                break;
            }

        case DOWN:
            {
                if (selectedIndex + colNum < totalitem) {
                    selectItem(selectedIndex + colNum);
                }
                wasProcesed = true;
                break;
            }
    }

    if (e.ctrlKey && e.keyCode == 70) {
        showSearch(e);
    }

    if (wasProcesed) {
        e.stopPropagation();
        e.preventDefault();
    }
});

$('body').on('click', '.items', (e) => {
    let item = e.target.classList[0] === "items" ? e.target : e.target.closest('.items');
    selectItem($('.items').index(item));
});

$('body').on('dblclick', '.items-list .items', (e) => {
    let item = e.target.classList[0] === "items" ? e.target : e.target.closest('.items');
    let title = document.title;

    if (item.dataset.type) {
        processFile(item);
    } else {
        config.serie.lastSerie = window.location.pathname;
        config.serie.SerieIndex = selectedIndex;

        let url = "/serie-content/" + item.id;
        window.history.pushState(title, title, url);

        lastIndex = selectedIndex;
        local.setItem('serie', item.id);
        loadPartialPage(url, () => {
            selectItem(0);
        });
    }

});


$(window).bind('popstate', (event) => {
    selectItem(0);
});

var goBack = () => {
    let title = "Home";
    window.history.pushState(title, title, config.serie.lastSerie);
    local.setItem('serie', false);
    loadPartialPage(config.serie.lastSerie, () => {
        selectItem(config.serie.SerieIndex);
    });
}

$('body').on('click', '#back', () => {
    goBack();
});

$('#content').scroll((e) => {
    let distance = $('#content').scrollTop();
    if (distance > 500) {
        $('#scroll-up').removeClass('d-none');
    } else {
        $('#scroll-up').addClass('d-none');
    }
});

$('#content').on('click', '#scroll-up', (e) => {
    $("#content").animate({ scrollTop: 0 }, "fast");
    console.log('test')
});

$(() => {
    selectItem(selectedIndex);
});


document.onkeydown = (e) =>{
    playerKeyDown(e);
    mangaVewerKeyDown(e);
}