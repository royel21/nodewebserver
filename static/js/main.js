window.history.replaceState(document.title, document.title, document.location.href);
var socket;

const loadPartialPage = async (url, cb) => {
    if (!url) return;

    $.get(url, { partial: true, screen: window.screen.width }, (resp) => {
        $('#container').replaceWith(resp.data);
        if (cb) cb();
    });
}

window.onpopstate = function (e) {
    let url = document.location.href;
    document.title = e.state;
    $('.sidenav a').removeClass("active");
    $(`.sidenav .nav-link:contains("${e.state}")`).addClass('active');
    loadPartialPage(url, () => {
        if ($('#series-list')[0]) selectItem(lastIndex);
    });
}

$('body').on('click', '#table-controls .page-item, #controls .page-item', (e) => {
    e.preventDefault();
    let title = document.title;
    let url = e.target.tagName == 'I' ? e.target.closest('a').href : e.target.href;
    window.history.pushState(title, title, url);
    loadPartialPage(url);
});

const choosePage = (el) => {
    let title = document.title;
    if (el.tagName == "FORM") {
        let path = location.pathname.split(/\/\d*\//)[0]+"/";
        console.log(path)
        let url = path + el.elements["page"].value + "/" + el.elements["items"].value + "/" + el.elements["search"].value;
        window.history.pushState(title, title, url.replace('//', '/'));
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