var isAndroid = /(android)/i.test(navigator.userAgent);
if(isAndroid){
    window.history.pushState({},"Log In", window.location.href);
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

$(window).on('popstate', function (e) {
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
         window.history.pushState(null, '','');
    }
});

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

const chooseCategory = (el) =>{
    let title = document.title;
    if (el.tagName == "FORM") {
        let cat = $(el).find('option[value='+el.elements["cat"].value+']').text();
        let url = '/categories/' + cat +'/';
        console.log(url)
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

$('#login').on('click',(e)=>{
        window.history.pushState({},"Log In", "/login");
});

$('.navbar ul .nav-link:not(#login)').click((e)=>{
    if(isAndroid){
        $('.navbar ul .active').removeClass('active');
        $(e.target.closest('.nav-link')).addClass('active');
        let text = e.target.closest('.nav-item').textContent;
        
        switch(text.trim()){
            case "Recents":{
                loadPartialPage("/");
                break;
            }
            case "Folders":{
                loadPartialPage("/folders");
                break;
            }
            case "Mangas":{
                loadPartialPage("/mangas");
                break;
            }
            case "All Videos":{
                loadPartialPage("/videos");
                break;
            }
            case "Favorites":{
                loadPartialPage("/favorites");
                break;
            }
            case "Categories":{
                loadPartialPage("/categories");
                break;
            }
        }
        e.preventDefault();  
    }
});
/********************************************modal********************/


var confirm = (message, className) => {
    $('#modal').empty().append($(`<div id="modal-header" class="text-center ${className}"><h2>${message}</h2></div>`));
    $('#modal').append($('<div class="text-center mt-3"><button class="btn btn-primary close-modal">Close<div>'));
    $('#modal button').focus();

    $('#modal-container').css({display: "flex"});
    $('#modal-container').fadeIn("fast", ()=>{
        $('#modal').fadeIn("fast");
    });
}

hideForm = () => {
    $('#modal-container').fadeOut("fast", ()=>{
        $('#modal').fadeOut("fast");
    });
}

$(document).on("click", ".close-modal", hideForm);

$('body').on('mousedown', '#modal-container', (e)=>{
    if(e.target.id.includes('modal-container')){
        hideForm();
    }
});