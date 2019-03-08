


// Replace name on modal for serie
$('#cover').change((e) => {
    $('#f-name').text(e.target.files[0].name)
});


//Submit Serie Entry for edit or create
$('#series-create-edit').submit((e) => {
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
                if ($('#series-list li').length === 12) {
                    $('#series-list li:first').addClass('active');
                    loadVideoSeries({});
                }
                hideForm();
            }
        }
    });
});

//Remove Serie Entry list
$('#series li .remove-serie').click((e) => {

    let li = e.target.closest('li');
    console.log(li.id)
    $.post($('#container').data('action') + 'delete-serie', { name: $(li).text().trim(), id: li.id, _csrf: $('#container').data('csrf') }, (resp) => {
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

//Load pagination page
$('#items-container').on('click', '.page-link', (e) => {
    e.preventDefault();
    let link = e.target.closest('a');
    let pageD = (link ? link : e.target).href.split('/');
    if (parseInt(pageD[5])) {
        let data = {};
        data.page = pageD[5];
        data.search = $('#video-list .search-input').val();
        loadVideoSeries(data, getId(e));
    }
});
//load filtered videos
$('#items-container').on('submit', '#search-videos', (e) => {
    e.preventDefault();
    
    loadVideoSeries({ search: $('#search-videos .search-input').val() },  getId(e));
});

$('#series').on('change','input[type="radio"]', (e) => {
    loadVideoSeries({});
});

$('#items-container').on('click','#search-videos .clear-search', (e) => {
    $('#search-videos .search-input').val('');
    loadVideoSeries({}, getId(e));
});

$('#items-container').on('change', '#select-page', (e) => {

    let data = { page: $('#page-select').val(), search: $('#search-input').val() };
    loadVideoSeries(data, getId(e));
});

$('#series').on('click', '.v-add, #add-filtered-videos', (e) => {
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
                    if (search) {
                        showError('Videos Agregados: ' + resp.count, 'text-success');
                    }
                    loadVideoSeries({ search });
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

