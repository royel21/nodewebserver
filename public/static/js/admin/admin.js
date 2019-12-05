
socket = io();

socket.on('disconnect', error => {
    console.log(error);
    if(error.includes('transport')){
        location.href = '/login';
    }
});

var loadFunctions = (page) => {
    switch (page) {
        case "Categories":
        case "Folders": {
            loadFoldersConfig();
            break;
        }
        case "Files": {
            loadFilesConfig();
            break;
        }
        case "Directories": {
            loadDirectories();
            break;
        }
        default: {

        }
    }
}

$('.sidenav .nav-link').click((e) => {
    e.preventDefault();
    let a = e.target.closest('a');
    let url = a.href;

    if (!url) return;

    window.history.pushState(a.textContent, a.textContent, url);
    document.title = a.textContent;
    $('.sidenav a').removeClass("active");
    a.classList.add('active');

    $('#container').fadeOut('fast');
    $.get(url, { partial: true, screen: window.screen.width }, (resp) => {
        $('#container').remove();
        $('#content').append(resp.data);
        loadFunctions($(e.target.closest('li')).text());
    });

});

$(document).on("click", ".show-form", (e) => {
    let tr = e.target.closest('tr');
    let li = e.target.closest('li');
    let uid = tr ? tr.id : li ? li.id : "";
    let action = $('#container').data('action');
    console.log(uid, action)
    $.get(action + "modal", { uid }, (resp) => {
        $('#modal').empty().append(resp);
        $('#modal-container').fadeIn("fast", ()=>{
            $('#modal').fadeIn("fast");
            $('#modal-container').css({display: "flex"});
        });
    });
});


$('body').on('click', 'tbody .fa-trash-alt', (e) => {
    let $tr = $(e.target.closest('tr'));
    let name = $tr.find('td').get(1).textContent;
    console.log($tr.attr('id'), name)
    $.post($('#container').data('action') + 'delete', { id: $tr.attr('id'), _csrf: $('#container').data('csrf') }, (resp) => {
        if (resp.status === "Ok") {
            
            $tr.fadeOut("fast", () => {
                $tr.remove();
                confirm(resp.msg, "text-success");
            });
        }else{
            confirm(resp.msg, "text-danger");
        }
    });
});

$(document).on('submit', '#create-edit', (e) => {
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

loadFunctions($('.sidenav li .active').text());