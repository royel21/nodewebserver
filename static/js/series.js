var loadVideos;
var getId;
var getAction;
var loadItemList;
var loadFromPager;
var _csrf;
var getCurPage;
var isAllVideo;
//load videos for current admin page
if (!loadVideos) {

    _csrf = $('#container').data('csrf');
    isAllVideo = () => {
        let tab = $('.list-titles input[type="radio"]:checked')[0];
        return tab ? tab.id.includes('all-videos') : false;
    }
    getAction = (e) => $('#container').data('action');
    //load videos list
    loadVideos = (data) => {

        data.isAllVideo = isAllVideo();

        let selecteditem = $('.list .content-list .active')[0];
        data.id = selecteditem ? selecteditem.id : "";

        let url = getAction() + 'videos-list';
        //console.log(url, data, selecteditem)

        $.get(url, data, (resp, status) => {
            $('#videos-list').replaceWith(resp);
        });
    }
    //load items list
    loadItemList = (data, cb) => {
        let url = getAction() + 'items-list';

        data.search = $('#items-list .search-input').val();
        $.get(url, data, (resp, status) => {
            $('#items-list').replaceWith(resp);
            if (cb) cb();
        });
    }
    // load page base on target pager
    loadFromPager = (element, data) => {
        if (element.closest('.list').id.includes('videos-list')) {
            data.search = $('#videos-list .search-input').val();
            loadVideos(data);
        } else {
            loadItemList(data, ()=>{
                if (!isAllVideo() || getAction().includes('categories'))
                loadVideos({ page: getCurPage('videos') }, 'videos-list');
            });

        }
    }

    getCurPage = (from) => $('#' + from + '-list #pager .active').text();


    $('body').on('submit', '#item-create-edit', (e) => {
        e.preventDefault();
        var formData = new FormData(e.target);
        $.ajax({
            url: getAction() + 'modal-post',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (resp) {
                if (resp.err) {
                    console.log(resp.message);
                } else {
                    loadItemList({ page: getCurPage('items') }, () => {
                        loadVideos({ page: getCurPage('videos') });
                    });
                    hideForm();
                }
            }
        });
    });

    $('body').on('change', '#modal #cover', (e) => {
        $('#f-name').text(e.target.files[0].name)
    });
}

//select a item from the list and load his video
$('#items-container').on('click', '.content-list li', (e) => {
    if (e.target.classList.contains('fas')) return;

    let li = e.target.tagName.includes('LI') ? e.target : e.target.closest('li');
    if (!li.classList.contains('active')) {
        $('.content-list li').removeClass("active");
        $(li).addClass('active');

        if (!isAllVideo() || getAction().includes('categories'))
            loadVideos({ page: getCurPage('videos') }, 'videos-list');
    }
});

//Load videos on tab change
$('#items-container .list-titles').on('change', 'input[type="radio"]', (e) => {
    loadVideos({});
});


//Load pagination page
$('#items-container').on('click', '.page-link', (e) => {
    e.preventDefault();
    let link = e.target.closest('a');

    let pageD = (link ? link : e.target).href.split('/');
    if (parseInt(pageD[5])) {
        let data = {};
        data.page = pageD[5];
        loadFromPager(link, data)
    }
});
// select page from pager
$('#items-container').on('change', '#select-page', (e) => {
    let data = { page: e.target.value };
    loadFromPager(e.target, data)
});
// filter content
$('#items-container').on('submit', 'form', (e) => {
    e.preventDefault();
    loadFromPager(e.target, {});
});
//clear filters from any side
$('#items-container').on('click', 'form .clear-search', (e) => {
    e.target.parentNode.previousSibling.value = "";
    loadFromPager(e.target, {});
});

//add videos to selected item
$('#items-container').on('click', '.v-add, #add-filtered-videos', (e) => {
    let liItem = $('#items-list li.active')[0];
    if (liItem) {
        let li = e.target.closest('li')
        let videoId = li ? li.id : null;

        let itemId = liItem.id;
        let search = $('#search-videos .search-input').val();
        
        if (videoId || search) {
            $.post(getAction() + 'add-videos', { itemId, search, videoId, _csrf }, (resp) => {
                if (resp.err) {
                    showError('Filtre primero no se puede agregar todos los videos juntos', 'text-danger');
                } else {
                    if (search) {
                        showError('Videos Agregados: ' + resp.count, 'text-success');
                    }
                    loadVideos({ search, page: getCurPage('videos') });
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

$('#items-container').on('click', '.fa-trash-alt', (e) => {
    let action = getAction();
    let isItem = e.target.closest('.list').id.includes('items-list');

    let postUrl = action + 'delete-' + (isItem ? 'item' : 'video');
    let li = e.target.closest('li');
    let id = li.id;
    let liItem = $('#items-list li.active')[0];
    
    $.post(postUrl, { itemId: li.id, videoId: id,_csrf }, (resp) => {
        console.log(resp);
        if (resp.state.includes('Ok')) {
            $(li).fadeOut('fast', (e) => {
                let vPage = getCurPage('videos');
                
                if (isItem) {
                    loadItemList({ page: getCurPage('items') }, () => {
                        loadVideos({ page: vPage });
                    });
                } else {
                    if(vPage.length > 0){
                        loadVideos({ page: vPage });
                    }else{
                        $(li).fadeOut('fast',()=>{
                            li.remove();
                        })
                    }
                }
            });
        }
    });
});
