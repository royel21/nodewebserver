
const contentScroll = document.getElementById('content')
const calCol = () => colNum = Math.floor((window.innerWidth - 15) / ($('.items').eq(0).width()));

var page = 1;
var selectedIndex = 0;
var totalPage = 0;
var currentPage = 0;

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
    currentPage = parseInt($('#pager .active').text()) || 0;
    totalPage = Math.ceil(parseInt($('.badge').text()) / parseInt($('#item').val())) || 0;
}

calPages();

$('body').on('keydown', '#video-list', (e) => {
    calCol();
    calPages();
    let totalitem = $('.items').length;
    let title = document.title;
    var wasProcesed = false;
    switch (e.keyCode) {
        case 13:
            {
                playVideo(e.target.closest('.items'));
                console.log("enter");
                wasProcesed = true;
                break;
            }
        case 37:
            {
                if (selectedIndex > 0) {
                    selectItem(selectedIndex - 1);
                } else {

                    if (currentPage > 1) {
                        let url = $('#pager .active').prev().find('a').attr('href');
                        window.history.pushState(title, title, url);
                        loadPartialPage(url, () => {
                            selectItem(totalitem - 1);
                        });
                    }
                }
                wasProcesed = true;
                break;
            }
        case 38:
            {
                if (selectedIndex - colNum >= 0) {
                    selectItem(selectedIndex - colNum);
                }
                wasProcesed = true;
                break;
            }
        case 39:
            {
                if (selectedIndex < totalitem - 1) {
                    selectItem(selectedIndex + 1);
                } else {
                    console.log("Next Page");
                    if (currentPage < totalPage) {
                        let url = $('#pager .active').next().find('a').attr('href');
                        window.history.pushState(title, title, url);
                        loadPartialPage(url, () => {
                            selectItem(0);
                        });
                    }
                }
                wasProcesed = true;
                break;
            }

        case 40:
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