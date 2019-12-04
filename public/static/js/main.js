var isAndroid = /(android)/i.test(navigator.userAgent);
if(isAndroid){
    window.history.replaceState(null, null);
}
var socket;

const loadPartialPage = async (url, cb) => {
    if (!url) return;
    
    $.get(url, { partial: true}, (resp) => {
        if(resp.data){
            $('#container').replaceWith(resp.data);
            if (cb) cb();
        }else{
            location.href = '/login';
        }
    });
}

window.onpopstate = function (e) {
    if(!isAndroid){
        let url = document.location.href;
        document.title = e.state;
        $('.sidenav a').removeClass("active");
        $(`.sidenav .nav-link:contains("${e.state}")`).addClass('active');
        loadPartialPage(url, () => {
            if ($('#folders-list')[0]) selectItem(lastIndex);
        });
    }else{
        e.preventDefault();
        window.history.pushState({}, '');
    }
}

$('body').on('click', '#table-controls .page-item, #controls .page-item', (e) => {
    e.preventDefault();
    let title = document.title;
    let url = e.target.tagName == 'I' ? e.target.closest('a').href : e.target.href;
    if(!isAndroid){
        window.history.pushState(title, title, url);
    }

    if(!location.href.includes("admin")){
        loadPartialPage(url, cb = () =>{
            selectItem(0);
        });    
    }else
    loadPartialPage(url);
});

const choosePage = (el) => {
    let title = document.title;
    if (el.tagName == "FORM") {
        let path = location.pathname.split(/\/\d*\//)[0]+"/";
        console.log(path)
        let url = path + el.elements["page"].value + "/" + el.elements["items"].value + "/" + el.elements["search"].value;
        if(!isAndroid){
            window.history.pushState(title, title, url.replace('//', '/'));
        }
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
        if(!isAndroid){
            let title = document.title;
            window.history.pushState(title, title, resp.url.replace('?partial=true', ''));
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

$('#full-screen').on('click', (e)=>{
    setfullscreen($('body')[0]);
});


if(isAndroid){
    $('#login').on('click',(e)=>{
       window.history.replaceState(null, null);
    });
}

$('.navbar ul:first-child .nav-link').click((e)=>{
    if(isAndroid){
        $('.navbar ul:first-child .active').removeClass('active');
        $(e.target.closest('.nav-link')).addClass('active');
        e.preventDefault();
        let text = e.target.closest('.nav-item').textContent;
        if(text.includes('Folders')){
            loadPartialPage("/");
        } 
        if(text.includes('Mangas')){
            loadPartialPage("/mangas");
        } 
        if(text.includes('All')){
            loadPartialPage("/videos");
        }   
    }
});