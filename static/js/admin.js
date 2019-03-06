
socket = io();

$('.sidenav .nav-link').click((e) => {
    e.preventDefault();
    let a = e.target.closest('a');
    let url = a.href;
    
    if (!url) return;

    window.history.pushState(a.textContent, a.textContent, url);
    document.title = a.textContent;
    $('.sidenav a').removeClass("active");
    a.classList.add('active');
    
    let script = "/js/";
    console.log($(e.target.closest('li')).text())
    switch($(e.target.closest('li')).text()){
        case "Series":{
            script += "series.js"
            break;
        }
        case "Peliculas":{
            script += "movies.js"
            break;
        }
        case "Categorias":{
            script += "categories.js"
            break;
        }
        case "Directorios":{
            script += "directories.js"
            break;
        }
        default:{
            script = "";
        }
    }
    var loadedScript = document.createElement("script");
    loadedScript.id = '#pagescript;'
    loadedScript.src = script;
    $('#pagescript').replaceWith(loadedScript);
    
    $.get(url, { partial: true, screen:  window.screen.width}, (resp) => {
        $('#container').replaceWith(resp.data);
    });
});

$(document).on("click", ".show-form", (e) => {
    let tr = e.target.closest('tr');
    let li = e.target.closest('li');
    let uid = tr ? tr.id : li ? li.id : "";
    let action = $('#container').data('action');
    console.log(uid, action)
    $.get(action + "modal", { uid }, (resp) => {
        $('body').prepend(resp);
        $('#modal').fadeIn();
    });
});

hideForm = () => {
    $('#modal-container').fadeOut(() => {
        $('#modal-container').remove();
    });
}

$(document).on("click", ".close-modal", hideForm);

var confirm = (message, className) => {
    $('#create-edit').remove();
    $('#modal-header').addClass(className).text(message)
    $('#modal').append($('<div class="text-center mt-3"><button class="btn btn-primary">Close<div>'));
    $('#modal').on('click', 'button', (e) => {
        hideForm();
    });
    $('#modal button').focus();
}

$('body').on('click', 'tbody .fa-trash-alt', (e) => {
    let tr = e.target.closest('tr');
    let $tr = $(tr);
    $.post($('#container').data('action') + 'delete', { id: tr.id, _csrf: $('#container').data('csrf'), name: $tr.text(), fid: $(tr).data('fid') }, (resp) => {
        if (resp) {
            console.log("deleting", $tr.text());
            $tr.fadeOut("fast", () => {
                $tr.remove();
            });
        }
    });
});

$(document).on('submit', '#create-edit', (e) => {
    console.log("testing")
    e.preventDefault();
    var $form = $('#create-edit');
    let formData = $(e.target).serializeArray();

    $.post($form.attr('action'), formData, (resp) => {

        switch (resp.state) {
            case "error": {
                $('#errors').append($('<span>').text(resp.data));
                break;
            }
            case "update": {
                $('#' + $('input[name="id"]').val()).replaceWith($(resp.data));
                confirm(resp.action + " " + resp.name + " Actualizado Con Exito", 'text-success');
                break;
            }
            case "create": {
                let items = $('#itemsPerPage').data('itemsperpage');
                if ($('tbody tr').length < (items || 10)) {
                    $('tbody').append(resp.data);
                }
                confirm(resp.action + " " + resp.name + " Agregado Con Exito", 'text-success');
                break;
            }
        }
    });
});

$('body').on('click', '.cat', (e) => {
    e.target.remove();
});


