
$('.sidenav .nav-link').click((e) => {
    e.preventDefault();
    let a = e.target.closest('a');
    let url = a.href;

    window.history.pushState(a.textContent, a.textContent, url);
    document.title = a.textContent;
    $('.sidenav a').removeClass("active");
    a.classList.add('active');
    loadPartialPage(url);
});

$(document).on("click", ".show-form", (e) => {
    let tr = e.target.closest('tr');
    let uid = tr ? tr.id : "";
    let action = $('#container').data('action');
    $.get(action, { uid }, (resp) => {
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

var confirm = (message) => {
    $('#create-edit').remove();
    $('#modal-header').addClass('text-success').text(message)
    $('#modal').append($('<div class="text-center mt-3"><button class="btn btn-primary">Close<div>'));
    $('#modal').on('click', 'button', (e) => {
        hideForm();
    });
    $('#modal button').focus();
}

$(document).on('submit', '#create-edit', (e) => {
    e.preventDefault();
    var $form = $('#create-edit');
    let formData = $(e.target).serializeArray();
    if ($form.attr('action').includes('movie')) {
        let cats = [];

        $('#cat-group .cat').each((i, el) => {

            cats.push(el.dataset.val);
        });

        formData.push({ name: "cats", value: cats });
    }

    $.post($form.attr('action'), formData, (resp) => {

        switch (resp.state) {
            case "error": {
                $('#errors').append($('<span>').text(resp.data));
                break;
            }
            case "update": {
                $('#' + $('input[name="id"]').val()).replaceWith($(resp.data));
                confirm(resp.action + " " + resp.name + " Actualizado Con Exito");
                break;
            }
            case "create": {
                let items = $('#itemsPerPage').data('itemsperpage');
                if ($('tbody tr').length < (items || 10)) {
                    $('tbody').append(resp.data);
                }
                confirm(resp.action + " " + resp.name + " Agregado Con Exito");
                break;
            }
        }
    });
});

$('body').on('click', '.cat', (e) => {
    e.target.remove();
});

$('body').on('click', '#add-cat', (e) => {
    let text = $('#movie-categories option:selected').text();
    let val = $('#movie-categories option:selected').val()
    if (!$('#cat-group').find('.cat[data-val="' + val + '"]').length) {
        let cat = `<label class="cat badge badge-primary mx-1" data-val="${val}">${text}</label>`
        $('#cat-group').append($(cat))
    }
});

$('body').on('click', '.tree-view .caret', (e) => {
    let treeItem = e.target.closest('li');
    if (treeItem.childNodes.length === 2) {
        let dir = $(treeItem).find('.dir').text();
        let path = e.target.closest('ul').dataset.path;

        $.post('/admin/configs/folder-content', {
            path, folder: dir,
            _csrf: $("#paths").data('csrf')
        }, (resp) => {

            $(treeItem).append(resp)
        });
    } else {
        $(treeItem).find('ul').remove();
    }
});

$('body').on('click', '.tree-view .dir', (e) => {
    let dir = e.target.textContent;
    let path = e.target.closest('ul').dataset.path;
    socket.emit('scan-dir',{path, folder: dir});
});

$('body').on('click', '#paths .fa-trash-alt', (e) => {

    let li = e.target.closest('li');
    $.post('/admin/configs/delete-path', {
        path: li.textContent,
        _csrf: $("#paths").data('csrf')
    }, (resp) => {
        if (resp == "ok") {
            $(li).fadeOut((e) => {
                li.remove();
            });
        }
    });
});