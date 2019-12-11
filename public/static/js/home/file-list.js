const contentScroll = document.getElementById('content');
const mediaContainer = document.getElementById('media-container');
const calCol = () => colNum = Math.floor($('#files-list').width() / $('.items').get(0).offsetWidth);

var page = 1;
var selectedIndex = local.getItem('selectedIndex') || 0;
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
        socket.emit('add-or-update-recent', currentFile);
    }
}


const calPages = () => {
    let data = document.getElementById('container').dataset;
    currentPage = parseInt(data.page);
    totalPage = parseInt(data.total);
}

const selectItem = (index) => {
    selectedIndex = index;
    var nextEl = $('.items').get(index);
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
    return nextEl;
}

const genUrl = (page) =>{
    currentPage = page;
    let path = location.pathname.split(/\/\d*\//)[0]+ '/';
    if(path === '//') path = '/recents/'
    return  path + page + "/" + $('input[name=items]').val() + "/" + $('input[name=search]').val();
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
    
    if(location.href === '/' || location.href.includes('/recents'))
        $('#files-list').prepend(item);
    mediaContainer.focus();
}

const chooseCategory = (el) => {
    let title = document.title;
    if (el.tagName == "FORM") {
        let cat = $(el).find('option[value=' + el.elements["cat"].value + ']').text();
        let url = '/categories/' + cat;
        console.log(url)
        window.history.pushState(title, title, url.replace('//', '/'));
        loadPartialPage(url);
    }
}

$('body').on('click', '#next-list-page, #prev-list-page', (e)=>{
    let page = currentPage;
    if(e.target.closest('span').id === 'next-list-page'){
        page++;
    }else{
       page--;
    }

    if(page === 0 || page === totalPage+1) return;
    
    let url = genUrl(page);
    loadPartialPage(url);
    window.history.pushState(document.title, document.title, url);
});
$('body').on('click', '.items .fa-play-circle', (e) => {
    processFile(e.target.closest('.items'));
});

$('body').on('keydown', '.items-list', (e) => {
    calCol();

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
                    let url = "/folder-content/" + item.id;
                    window.history.pushState(title, title, url);
                    lastIndex = selectedIndex;
                    local.setItem('folder', item.id);
                    config.folder.folderIndex = selectedIndex;
                    loadPartialPage(url, () => {
                        selectItem(0);
                    });
                }
                wasProcesed = true;
                break;
            }
        case LEFT:
            {
                if (selectedIndex > 0) {
                    selectItem(selectedIndex - 1);
                }else
                if (currentPage > 1 || e.ctrlKey && currentPage > 1 ) {

                    let url = genUrl(currentPage-1);
                    window.history.pushState(title, title, url);
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
                }else
                if (currentPage < totalPage || e.ctrlKey && currentPage < totalPage) {

                    let url = $('#pager .active').next().find('a').attr('href');
                    window.history.pushState(title, title, url);
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
                lastItem.id = item.id;
                let title = document.title;

                if (item.dataset.type) {
                    processFile(item);
                } else {
                    config.folder.lastfolder = window.location.pathname;
                    config.folder.folderIndex = selectedIndex;

                    let url = "/folder-content/" + item.id;
                    window.history.pushState(title, title, url);

                    lastIndex = selectedIndex;
                    local.setItem('folder', item.id);
                    loadPartialPage(url, () => {
                        selectItem(0);
                    });
                }
            }
            
            dblclick = 0;
            clearTimeout(timeOut);
            timeOut = null;
        }, 300);
    }
    selectItem($('.items').index(item));
    lastItem.id = item.id;
});



$(window).bind('popstate', (event) => {
    selectItem(0);
});

var goBack = () => {
    let title = "Home";
    window.history.pushState(title, title, config.folder.lastfolder);
    local.setItem('folder', false);
    loadPartialPage(config.folder.lastfolder, () => {
        selectItem(config.folder.folderIndex);
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
});

$(() => {
    calPages();
    selectItem(selectedIndex);
});


$('body').on('click', '.items .item-fav', (e)=>{
    let item = e.target.classList[0] === "items" ? e.target : e.target.closest('.items');
    console.log(e.target, item.id);
    $.post('/favorites/addfav',{id: item.id, _csrf: $('#search-form input[name=_csrf]').val()}, (resp) => {
        console.log(resp);
        if(resp.result){
            $(e.target).toggleClass('text-warning far fas');
        }
    });
    e.preventDefault();
    e.stopPropagation();

});

$('body').on('click', '.items .item-del', (e)=>{
    let item = e.target.classList[0] === "items" ? e.target : e.target.closest('.items');
    let action = location.href.includes('favorites') ? '/favorites/remove' : '/recents/remove' ;
    $.post(action, {id: item.id, _csrf: $('#search-form input[name=_csrf]').val()}, (resp) => {
        console.log(resp);
        if(resp.result)
            $(item).fadeOut(()=>{ item.remove(); });
    });

    e.preventDefault();
    e.stopPropagation();

});

document.onkeydown = (e) => {
    playerKeyDown(e);
    mangaVewerKeyDown(e);
}

