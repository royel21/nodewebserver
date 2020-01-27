var isAndroid = /(android)|(iphone)/i.test(navigator.userAgent);
var socket;

let lastUrl;

var pageHistory = {
    recents: { pathname: "", selectedIndex: 0 },
    folders: { pathname: "", selectedIndex: 0 },
    mangas: { pathname: "", selectedIndex: 0 },
    videos: { pathname: "", selectedIndex: 0 },
    categories: { pathname: "", selectedIndex: 0 },
    favorities: { pathname: "", selectedIndex: 0 },
    administrator: { pathname: "", selectedIndex: 0 }
}

const setSelectedItemInPage = (index) => {
    pageHistory[$('#menu input:checked')[0].id].selectedIndex = index;
}

const loadPartialPage = async(url, cb) => {
    if (!url) return;

    let text = $('.navbar input:checked').next().text().trim();
    document.title = text;
    window.history.pushState(text, text, url.replace('//', '/'));
    if (!location.pathname.includes('admin'))
        pageHistory[$('#menu input:checked')[0].id].pathname = url;

    $.get(url, { partial: true }, (resp) => {
        if (resp.data) {
            $('#container').replaceWith(resp.data);

            if (!location.pathname.includes('/admin')) {
                local.setItem('lasturl', url);
                calPages();
            }
            if (cb) cb();
        } else {
            //location.href = '/login';
        }
    });
}

$(window).on('popstate', function(e) {
    selectedIndex = 0;
    location.reload();
});

$('body').on('click', '#table-controls .page-item a, #controls .page-item a', (e) => {
    e.preventDefault();

    let url = e.target.tagName == 'I' ? e.target.closest('a').pathname : e.target.pathname;

    if (!location.href.includes("admin")) {
        loadPartialPage(url, cb = () => {
            selectItem(0);
        });
    } else
        loadPartialPage(url);
});


const genUrl = (page) => {
    let orderby = local.getItem('orderby') || $('#order-select').val();
    let iperpage =  document.querySelector('select[name=items]').value;
    let search = $('input[name=search]').val();
    currentPage = page;
    let path = location.pathname.split(/\/\d*\//)[0] + '/';
    
    if (path === '//') {
        path = '/recents/';
    } else if (!path.includes('recent')) {
        let datapath = [];
        if (path.includes('folder-content') || path.includes('categories')) {
            datapath = path.split('/').slice(1, 4);
        } else {
            datapath = path.split('/').slice(1, 3);
        }

        datapath[1] = orderby;
        path = '/' + datapath.join('/');

    }

    return `${path}/${page}/${iperpage}/${search}`;
}

$('#content').on('change','#controls #itemperpage, #controls #page-select', (el) => {
    let page = document.querySelector('select[name=page]').value;
    let url = genUrl(page);
    loadPartialPage(url);
});

const submitItemAndSearchForm = (e) => {
    let form;

    if (e.tagName == "FORM") {
        form = e;
    } else {
        e.preventDefault();
        form = e.target.closest('form');
    }

    let url = $(form).attr('action');
    $.post(url, $(form).serialize(), (resp) => {
        if (resp.data) {
            $('#container').replaceWith(resp.data);
            let title = document.title;
            window.history.pushState(title, title, resp.url.replace('?partial=true', ''));
            if (!location.pathname.includes('admin'))
                pageHistory[$('#menu input:checked')[0].id].pathname = resp.url.replace('?partial=true', '');
        }
    });
}

$('body').on('click', '#search-form .clear-search', (e) => {
    $('#search-form .search-input').val('');
    submitItemAndSearchForm(e.target.closest('form'));
});

$('body').on('submit', '#search-form', submitItemAndSearchForm);

$('#error-bottom .btn').click((e) => $('#error-container').fadeOut('fast'));

const showError = (msg, className) => {
    $('#error-body').removeClass().addClass(className).empty().append("<span>" + msg);
    $('#error-container').css({ display: "flex" }).hide().fadeIn('fast');
}

$('#full-screen').on('click', (e) => {
    setfullscreen($('body')[0]);
});

$('#login').on('click', (e) => {
    window.history.pushState({}, "Log In", "/login");
    history.go(-(history.length - 1));
});

$('.navbar input[type=radio]').change((e) => {
    let url = pageHistory[e.target.id].pathname || e.target.value;
    if (location.pathname.includes('admin')) {
        return location.href = url;
    }

    if (!url.includes('admin'))
        loadPartialPage(url, () => {
            selectItem(pageHistory[e.target.id].selectedIndex);
        });

});
/********************************************modal********************/


var confirm = (message, className) => {
    $('#modal').empty().append($(`<div id="modal-header" class="text-center ${className}"><h2>${message}</h2></div>`));
    $('#modal').append($('<div class="text-center mt-3"><button class="btn btn-primary close-modal">Close<div>'));
    $('#modal button').focus();

    $('#modal-container').css({ display: "flex" });
    $('#modal-container').fadeIn("fast", () => {
        $('#modal').fadeIn("fast");
    });
}

hideForm = () => {
    $('#modal-container').fadeOut("fast", () => {
        $('#modal').fadeOut("fast");
    });
}

$(document).on("click", ".close-modal", hideForm);

$('body').on('mousedown', '#modal-container', (e) => {
    if (e.target.id.includes('modal-container')) {
        hideForm();
    }
});
var lastPage;
if (isAndroid) {

    setInterval((e) => {
        if (lastPage !== currentFile.pos) {
            lastPage = currentFile.pos;
            socket.emit('add-or-update-recent', currentFile);
        }
    }, 30000);

    if (document.body.offsetHeight < 750) {
        $('#files-list').css({ paddingBottom: 60 });
    }
}

$(() => {
    let phistory = local.getObject('history');
    if (phistory) {
        pageHistory = phistory;
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then((result) => {
                console.log('worker registed');
            }).catch(err => {
                console.log('worker not registed');
            });
    }
});