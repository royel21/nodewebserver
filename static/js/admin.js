
$(document).on("click", ".show-form", (e) => {
    let tr = e.target.closest('tr');
    let uid = tr ? tr.id : "";
    let action = $('#table-container').data('action');
    console.log(action, uid)
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
        console.log("movies");
        $('#cat-group .cat').each((i, el) => {
            console.log(el.dataset.val, i);
            cats.push(el.dataset.val);
        });
        console.log(formData);
        formData.push({ name: "cats", value: cats });
    }
    
    $.post($form.attr('action'), formData, (resp) => {
        console.log(resp)

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
                console.log(items || 10)
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
    console.log($('#cat-group').find('.cat[data-val="' + val + '"]').length)
    // $.post("/admin/array-test", {data:JSON.stringify(["one", "two", "three"])}, (resp)=>{
    //     console.log(resp);
    // })
});

$('body').on('click', '.tree-view .caret', (e) => {
    let treeItem = e.target.closest('li');
    if (treeItem.childNodes.length === 2) {
        let dir = $(treeItem).find('.dir').text();
        let path = e.target.closest('ul').dataset.path;

        $.post('/admin/folder-content', { path, folder: dir }, (resp) => {

            $(treeItem).append(resp)
        });
    } else {
        $(treeItem).find('ul').remove();
    }
});

$('body').on('click', '.tree-view .dir', (e) => {
    let dir = e.target.textContent;
    let path = e.target.closest('ul').dataset.path;
    $.post('/admin/add-path', { path, folder: dir }, (resp) => {
        $("#paths").append(resp);
    });
});

$('body').on('click', '#paths .fa-trash-alt', (e) => {

    let li = e.target.closest('li');
    $.post('/admin/delete-path', { path: li.textContent }, (resp) => {
        console.log(resp);
        if (resp == "ok") {
            $(li).fadeOut((e) => {
                li.remove();
            });
        }
    });
});

$('#clear-search').click((e)=>{
    $('#search-input').val("");
    $('#search-form').submit();
})

const socket = io();
