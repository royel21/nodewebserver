
socket = io();
socket.on("disk-loaded", (data) => {
    $('#disks').empty().append(data);
});

socket.on('path-added', (newPath) => {
    console.log(newPath);
    if (newPath) {
        $("#paths").append(newPath);
    }
});

socket.on("scan-finish", (data) => {
    console.log(data)
    $('#' + data.id + ' .fa-sync').removeClass('fa-spin');
});

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

var confirm = (message) => {
    $('#create-edit').remove();
    $('#modal-header').addClass('text-success').text(message)
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

$('body').on('click', '.fa-sync', (e) => {
    $(e.target).addClass('fa-spin');
    let li = e.target.closest('li');
    let dir = $(li).text();
    console.log(li.id, dir);
    socket.emit('re-scan', { id: li.id, dir });
});

$('body').on('click', '.tree-view .dir', (e) => {
    let dir = e.target.textContent;
    let path = e.target.closest('ul').dataset.path;
    socket.emit('scan-dir', { path, folder: dir });
});

$('body').on('click', '#paths .delete-path', (e) => {

    let li = e.target.closest('li');
    console.log(li.id)
    $.post('/admin/configs/delete-path', {
        id: li.id,
        _csrf: $("#paths").data('csrf')
    }, (resp) => {
        console.log("delete:" + resp);
        if (resp == "ok") {
            $(li).fadeOut((e) => {
                li.remove();
            });
        }
    });
});

// Replace name on modal for serie
$('body').on('change', '#cover', (e) => {
    $('#f-name').text(e.target.files[0].name)
});
//Submit Serie Entry for edit or create
$(document).on('submit', '#series-create-edit', (e) => {
        e.preventDefault();
        console.log("Uploading", e.target)
        var formData = new FormData(e.target);
        $.ajax({
            url: '/admin/series/modal-post',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (resp) {
               console.log(resp);
            }
        });
});

//Remove Serie Entry list
$('body').on('click', '#remove-serie', (e)=>{
    
        let li = e.target.closest('li');
        console.log(li.id)
        $.post($('#container').data('action')+'delete-serie', {id: li.id, _csrf: $('#container').data('csrf')}, (resp) =>{
            console.log(resp);
                if(resp.state !== "err"){
                    $(li).fadeOut('fast',(e)=>{
                           li.remove();
                    });
                } 
        }); 
});

$('body').on('change', '#series-content input[type="radio"]', (e)=>{
    console.log(e.target);
    let id = e.target.id.replace('tab-', '');
    let selectedSerie = $('#series-list .active')[0];
    let serieId = selectedSerie ? selectedSerie.Id : "";
    console.log(id, selectedSerie, serieId);
   $.post($('#container').data('action')+id, {serieId, _csrf: $('#container').data('csrf')}, (resp) =>{
        console.log(resp);
        $('#video-list').replaceWith(resp)
   });
});

$(() => {
    loadDisk(window.location.href);
});
