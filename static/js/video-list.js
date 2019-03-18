
const contentScroll = document.getElementById('content')
const calCol = () => colNum = Math.floor((window.innerWidth - 15) / ($('.items').eq(0).width()));

var page = 1;
var selectedIndex = local.getItem('selectedIndex') || 0;
var totalPage = 0;
var currentPage = 1;


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

$('body').on('keydown', '.items-list', (e) => {
    calCol();
    calPages();
    console.log(currentPage, totalPage)
    let totalitem = $('.items').length;
    let title = document.title;
    var wasProcesed = false;
    switch (e.keyCode) {
        case 13:
            {
                let item = e.target.closest('.items')
                if ($('#videos-list')[0]) {
                    playVideo(item);
                } else {
                    let url = "/serie-content/" + item.id;
                    window.history.pushState(title, title, url);
                    console.log(url);
                    lastIndex = selectedIndex;
                    loadPartialPage(url, () => {
                        selectItem(0);
                    });
                }
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
                        console.log("Prev Page");
                        let url = $('#pager .active').prev().find('a').attr('href');
                        window.history.pushState(title, title, url);
                        loadPartialPage(url, () => {
                            selectItem($('.items').length - 1);
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

                    if (currentPage < totalPage) {
                        console.log("Next Page");
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

$('body').on('click', '.items', (e) => {
    let item = e.target.classList[0] === "items" ? e.target : e.target.closest('.items');
    selectItem($('.items').index(item));
});

$('body').on('dblclick', '.items-list .items', (e) => {
    let item = e.target.classList[0] === "items" ? e.target : e.target.closest('.items');
    let title = document.title;

    if ($('#videos-list')[0]) {
        playVideo(item);
    } else {
        config.serie.lastSerie = window.location.pathname;
        config.serie.SerieIndex = selectedIndex;
        
        let url = "/serie-content/" + item.id;
        window.history.pushState(title, title, url);

        lastIndex = selectedIndex;

        loadPartialPage(url, () => {
            selectItem(0);
        });
    }

});


$(window).bind('popstate', (event) => {
    console.log('pop: ' + event.originalEvent.state);
    selectItem(0);
});

$('body').on('click', '#back', ()=>{
    let title = "Home";
    window.history.pushState(title, title, config.serie.lastSerie);
    loadPartialPage(config.serie.lastSerie, () => {
        selectItem(config.serie.SerieIndex);
    });
});

$('#content').scroll((e)=> {
    let distance = $('#content').scrollTop();
    if(distance > 500){
        $('#scroll-up').removeClass('d-none');
    }else{
         $('#scroll-up').addClass('d-none');
    }
});

 $('#content').on('click', '#scroll-up',(e)=>{
    $("#content").animate({ scrollTop: 0 }, "fast");
    console.log('test')
 });

$(() => {
    selectItem(selectedIndex);
});