
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

//select list
$('body').on('click', '#series li', (e) => {
    let li = e.target.tagName.includes('LI') ? e.target : e.target.closest('li');
    $('#series li').removeClass("active");
    $(li).addClass('active');
    loadVideoSeries({});
});

//Submit Serie Entry for edit or create
$(document).on('submit', '#series-create-edit', (e) => {
    e.preventDefault();
    var formData = new FormData(e.target);
    $.ajax({
        url: '/admin/series/modal-post',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function (resp) {
            if (resp.err) {
                console.log(resp.message);
            } else {
                $('#series-list ul').append(resp);
                if($('#series-list li').length === 1){
                    $('#series-list li:first').addClass('active');
                    loadVideoSeries({});
                }
                hideForm();
            }
        }
    });
});

//Remove Serie Entry list
$('body').on('click', '.remove-serie', (e) => {

    let li = e.target.closest('li');
    console.log(li.id)
    $.post($('#container').data('action') + 'delete-serie', { id: li.id, _csrf: $('#container').data('csrf') }, (resp) => {
        console.log(resp);
        if (resp.state !== "err") {
            $(li).fadeOut('fast', (e) => {
                li.remove();
                let $li = $('#series li:first');
                if ($li[0]) {
                    $('#series li:first').addClass('active');
                    loadVideoSeries({});
                }
            });
        }
    });
});

const loadVideoSeries = (data) => {

    let selectedSerie = $('#series-list .active')[0];
    let id = $("#series-content input[name='tabs']:checked")[0].id;

    data.serieId = selectedSerie ? selectedSerie.id : "";
    data.isAllVideo = id.includes('all-videos') ? true : false;

    $.get($('#container').data('action') + 'videos-list', data, (resp, status) => {
        $('#video-list').replaceWith(resp);
        console.log(status);
    });
}
//Load pagination page
$('body').on('click', '#series-content #pager a', (e) => {
    e.preventDefault();
    let link = e.target.closest('a');
    let pageD = (link ? link : e.target).href.split('/');
    if (parseInt(pageD[5])) {
        let data = {};
        data.page = pageD[5];
        data.search = $('#search-input').val();
        loadVideoSeries(data);
    }
});
//load filtered videos
$('body').on('submit', '#series-content #search-video', (e) => {
    e.preventDefault();
    loadVideoSeries({ search: $('#search-input').val() });
});

$('body').on('change', '#series-content input[type="radio"]', (e) => {
    loadVideoSeries({});
});

$('body').on('click', '#clear-search-video', (e) => {
    $('#search-video #search-input').val('');
    loadVideoSeries({});
});

$('body').on('change', '#series-content #select-page', (e) => {

    let data = { page: $('#page-select').val(), search: $('#search-input').val() };
    loadVideoSeries(data);
});

$('body').on('click', '#series-content .v-add, #add-filtered-videos', (e) => {
    if ($('#series li.active')[0]) {
        let li = e.target.closest('li')
        let videoId = li ? li.id : null;

        let serieId = $('#series li.active')[0].id;
        let search = $('#search-input').val();
        let _csrf = $('#container').data('csrf');
        if (videoId || search) {
            $.post('/admin/series/add-videos-to-serie', { serieId, search, videoId, _csrf }, (resp) => {
                if (resp.err) {
                    showError('Filtre primero no se puede agregar todos los videos juntos', 'text-danger');
                } else {
                    if(search){
                          showError('Videos Agregados: ' + resp.count, 'text-success');
                    }
                     loadVideoSeries({search});
                }
            });
        } else {
            console.log("vId & search null")
            showError('Filtre primero no se puede agregar todos los videos juntos', 'text-danger');
        }

    } else {
        showError('No Hay Serie Para Agregar Video', 'text-danger');
    }
});


$('body').on('change', '#tab-config input[type="radio"]',(e)=>{
        console.log(e.target);
        $('#paths').toggleClass('d-none');
        $('#tree-container').toggleClass('d-none');
        if(e.target.id.includes('disk')){
            loadDisk(window.location.href);   
        }
});

