window.history.replaceState(document.title, document.title, document.location.href);
var socket;

loadDisk = (url) => {
    if (url.includes('config')) {
        socket.emit('load-disks', "load now");
    }
}

const loadPartialPage = async (url, cb) => {
    if (!url) return;

    $.get(url, { partial: true }, (resp) => {
        $('#container').replaceWith(resp.data);
        if (cb) cb();
        loadDisk(url);
    });
}

window.onpopstate = function (e) {
    let url = document.location.href;
    document.title = e.state;
    $('.sidenav a').removeClass("active");
    $(`.sidenav .nav-link:contains("${e.state}")`).addClass('active');
    loadPartialPage(url);
}

$('body').on('click', '.page-item', (e) => {
    e.preventDefault();
    let title = document.title;
    let url = e.target.tagName == 'I' ? e.target.closest('a').href : e.target.href;
    window.history.pushState(title, title, url);
    loadPartialPage(url);
});

const choosePage = (el) =>{
    let title = document.title;
    if (el.tagName == "FORM") {
        let path = location.pathname.split(/\d/ig)[0];
        let url = (path === "/" ? "/home/" : path )+el.elements["page"].value+"/"+el.elements["items"].value+"/"+el.elements["search"].value;
        window.history.pushState(title, title, url);
        loadPartialPage(url);
    }
}

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

        $('#container').replaceWith(resp.data);
        let title = document.title;
        window.history.pushState(title, title, resp.url.replace('?partial=true', ''));

    });
}

$('body').on('click', '#clear-search', (e) => {
    $('#search-input').val('');
    submitItemAndSearchForm(e.target.closest('form'));
});

$('body').on('submit', '#search-form', submitItemAndSearchForm);


$(()=>{
    
//     $('#menu a').removeClass("active");
//     $('#menu a[href=""]').addClass('active'); 

});