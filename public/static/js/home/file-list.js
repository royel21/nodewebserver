const contentScroll = document.getElementById('content');
const mediaContainer = document.getElementById('media-container');
const calCol = () => colNum = Math.floor($('#files-list').width() / $('.items').get(0).offsetWidth);

var page = 1;
var selectedIndex = parseInt(local.getItem('selectedIndex')) || 0;
var totalPage;
var currentPage;

const UP = 38;
const DOWN = 40;
const LEFT = 37;
const RIGHT = 39;
const ENTER = 13;

var socket = io();

let currentFile = { id: 0, currentPos: 0 };

var config = {
    sortBy: "Name-D",
    folder: { lastfolder: "", lastIndex: 0 },
    volume: 0,
    isMuted: false,
    paused: true,
    hidecontrolduration: 3,
    recentVideoMax: 100,
    recentVideos: [],
    itemsPerPage: 0,
    foldersPerPage: 0,
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

window.onbeforeunload = (e) => {
    if (config) {
        local.setObject('config', config);
        local.setItem('selectedIndex', selectedIndex);
        local.setObject('history', pageHistory);
        socket.emit('add-or-update-recent', currentFile);
    }
}

const getElByIndex = (index) => [...document.querySelectorAll('.items')][index];

const getItemIndex = (item) => {
    return [...document.querySelectorAll('.items')].indexOf(item);
}

const calPages = () => {
    let data = document.getElementById('container').dataset;
    currentPage = parseInt(data.page);
    totalPage = parseInt(data.total);
}

const selectItem = (index) => {
    selectedIndex = index;
    var nextEl = getElByIndex(index);
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
    $('.items').removeClass('active');
    $(nextEl).addClass('active');
    setSelectedItemInPage(index);
    return nextEl;
}

processFile = (item) => {

    lastItem.id = item.id;

    switch (item.dataset.type) {
        case "Manga":
            {
                $('#manga-viewer').removeClass('d-none');
                $('#video-viewer').addClass('d-none');
                openManga(item);

                mediaContainer.focus();
                break;
            }
        case "Video":
            {
                $('#manga-viewer').addClass('d-none');
                $('#video-viewer').removeClass('d-none');
                playVideo(item);

                mediaContainer.focus();
                break;
            }
        default:
            {
                config.folder.lastfolder = window.location.pathname;
                config.folder.folderIndex = selectedIndex;
                let orderby = $('#order-select').val();


                lastIndex = selectedIndex;
                local.setItem('folder', item.id);
                let url = "/folder-content/" + orderby + '/' + item.id;

                loadPartialPage(url, () => {
                    selectItem(0);
                });
            }
    }


    if (location.href === '/' || location.href.includes('/recents'))
        $('#files-list').prepend(item);
    //Select current file
    selectItem(getItemIndex(item));

}

const chooseList = (el) => {
    let title = document.title;
    let orderby = $('#order-select').val();
    if (el.tagName == "SELECT") {
        let url = `/categories/${orderby}/${$('#list-select option:selected').text()}`;
        loadPartialPage(url);
    }
}

const selectOrder = (el) => {
    local.setItem('orderby', el.value);
    loadPartialPage(genUrl($('#container').data('page')));
}

$('body').on('click', '#next-list-page, #prev-list-page', (e) => {
    let action = e.target.closest('span').id;
    let page = currentPage;
    if (action === 'next-list-page') {
        page++;
    } else {
        page--;
    }

    if (page === 0 || page === totalPage + 1) return;

    let url = genUrl(page);
    loadPartialPage(url, () => {
        if (action === 'next-list-page') {
            selectItem(0);
        } else {
            selectItem($('.items').length - 1);
        }
    });
});
$('body').on('click', '.items .item-play, .item .fa-folder', (e) => {
    processFile(e.target.closest('.items'));
});

$('body').on('keydown', '.items-list', (e) => {
    calCol();

    let totalitem = $('.items').length;
    var wasProcesed = false;
    switch (e.keyCode) {
        case ENTER:
            {
                let item = e.target.closest('.items');
                processFile(item);
                wasProcesed = true;
                break;
            }
        case LEFT:
            {
                if (selectedIndex > 0) {
                    selectItem(selectedIndex - 1);
                } else
                if (currentPage > 1 || e.ctrlKey && currentPage > 1) {

                    let url = genUrl(currentPage - 1);
                    loadPartialPage(url, () => {
                        selectItem($('.items').length - 1);
                    });
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
                if (selectedIndex < totalitem - 1) {
                    selectItem(selectedIndex + 1);
                } else
                if (currentPage < totalPage || e.ctrlKey && currentPage < totalPage) {

                    let url = genUrl(currentPage + 1);
                    loadPartialPage(url, () => {
                        selectItem(0);
                    });
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
        //showSearch(e);
    }

    if (wasProcesed) {
        e.stopPropagation();
        e.preventDefault();
    }
});
var dblclick = 0;
var lastItem = { id: "" };
var timeOut;
$('body').on('click', '.items', (e) => {
    let item = e.target.classList[0] === "items" ? e.target : e.target.closest('.items');
    dblclick++;
    if (!timeOut) {
        timeOut = setTimeout(() => {
            if (dblclick > 1 && lastItem.id === item.id) {
                processFile(item);
            }

            dblclick = 0;
            clearTimeout(timeOut);
            timeOut = null;
        }, 300);
    }
    selectItem(getItemIndex(item));
    lastItem.id = item.id;
});

var goBack = () => {
    local.setItem('folder', false);
    loadPartialPage(config.folder.lastfolder, () => {
        selectItem(config.folder.folderIndex);
    });
}

$('body').on('click', '#goback', () => {
    goBack();
});

var lastScroll;

$('#content').scroll((e) => {
    let distance = $('#content').scrollTop();
    //     if (distance > 500) {
    //         $('#scroll-up').removeClass('d-none');
    //     } else {
    //         $('#scroll-up').addClass('d-none');
    //     }

    //     if(lastScroll < distance){
    //        $('#controls').addClass('d-none');
    //     }else{
    //        $('#controls').removeClass('d-none');
    //     }
    //     lastScroll = distance;
});

$('#content').on('click', '#scroll-up', (e) => {
    $("#content").animate({ scrollTop: 0 }, "fast");
});

$(() => {
    calPages();
    selectItem(selectedIndex);
    let cat = $('#cat-select option:selected').text();
    if(location.pathname.includes('categories') && !location.pathname.includes(cat)){
        let text = document.title;
        let url = location.pathname + `${cat}/`
        history.replaceState(text, text, url);
    }
});


$('body').on('click', '.items .item-fav', (e) => {
    let item = e.target.classList[0] === "items" ? e.target : e.target.closest('.items');
    console.log(e.target, item.id);
    $.post('/favorites/addfav', { id: item.id, _csrf: $('#search-form input[name=_csrf]').val() }, (resp) => {
        console.log(resp);
        if (resp.result) {
            $(e.target).toggleClass('text-warning far fas');
        }
    });
    e.preventDefault();
    e.stopPropagation();

});

$('body').on('click', '.items .item-del', (e) => {
    let item = e.target.classList[0] === "items" ? e.target : e.target.closest('.items');
    let action = location.href.includes('favorites') ? '/favorites/remove' : '/recents/remove';
    $.post(action, { id: item.id, _csrf: $('#search-form input[name=_csrf]').val() }, (resp) => {
        console.log(resp);
        if (resp.result)
            $(item).fadeOut(() => { item.remove(); });
    });

    e.preventDefault();
    e.stopPropagation();

});

document.onkeydown = (e) => {
    playerKeyDown(e);
    mangaVewerKeyDown(e);
}

$('body', ).on('click', '#current-page', function() {
    if (!$('#current-page input')[0]) {
        let numberOfPages = $('#container').data('total');
        this.textContent = "";
        var $input = $(
            `<input type="text" value=${currentPage} class="form-control"
                         style="width:50px; padding: 0 0 0 4px; font-size:15px; color: black;" min=1 
                         max=${numberOfPages}>`
        ).appendTo($(this)).focus();

        $input.on('focusout', (e) => {
            $('#current-page').text(currentPage + '/' + numberOfPages);
        });
        $input.on('keyup', (event) => {
            if (event.keyCode === 13) {
                currentPage = parseInt($input.val());

                if (currentPage > numberOfPages) {
                    currentPage = numberOfPages;
                }
                $input = null;
                loadPartialPage(genUrl(currentPage));
            }
        });
        $input[0].setSelectionRange($input.val().length, $input.val().length);
        $input.focus();
    }
});


function handleBrowserState(isActive) {
   // socket.emit('add-or-update-recent', { msg: "focus", state: isActive });
}

window.addEventListener("focus", handleBrowserState.bind(true));
window.addEventListener("blur", handleBrowserState.bind(false));


addEventListener("resume", (e) => {
    handleBrowserState(true);
});

$('body').on('click', '#content .item-btns .fa-folder', (e) => {
    let item = e.target.closest('.items');
    processFile(item);
});