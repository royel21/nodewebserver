var loadFoldersConfig = () => {
    let getAction;
    let loadItemList;
    let loadFromPager;
    let _csrf;
    let getCurPage;
    let isAllFile;
    
    //load files for current admin page
    _csrf = $('#container').data('csrf');
    isAllFile = () => {
        let tab = $('.list-titles input[type="radio"]:checked')[0];
        return tab ? tab.id.includes('all-files') : false;
    }
    getAction = (e) => $('#container').data('action');
    //load files list
    loadFiles = (data) => {

        data.isAllFiles = isAllFile();

        let selecteditem = $('.list .content-list .active')[0];
        data.id = selecteditem ? selecteditem.id : "";

        let url = getAction() + 'file-list';

        $.get(url, data, (resp, status) => {
            $('#file-list').replaceWith(resp);
            $('#total-files').text("Total - " + $('#file-list').data('total'));
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
        if (element.closest('.list').id.includes('file-list')) {
            data.search = $('#file-list .search-input').val();
            loadFiles(data);
        } else {
            loadItemList(data, () => {
                if (!isAllFile() || getAction().includes('categories'))
                    loadFiles({ page: getCurPage('files') }, 'file-list');
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
                        loadFiles({ page: getCurPage('files') });
                    });
                    hideForm();
                }
            }
        });
    });

    $('body').on('change', '#modal #cover', (e) => {
        $('#f-name').text(e.target.files[0].name)
    });

    //select a item from the list and load its file
    $('#items-container').on('click', '.content-list li', (e) => {
        if (e.target.classList.contains('fas')) return;

        let li = e.target.tagName.includes('LI') ? e.target : e.target.closest('li');
        if (!li.classList.contains('active')) {
            $('.content-list li').removeClass("active");
            $(li).addClass('active');

            if (!isAllFile() || getAction().includes('categories'))
                loadFiles({ page: getCurPage('files') }, 'file-list');
        }
    });

    //Load files on tab change
    $('#items-container .list-titles').on('change', 'input[type="radio"]', (e) => {
        loadFiles({});
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

    //add files to selected item
    $('#items-container').on('click', '.v-add, #add-filtered-files', (e) => {
        let liItem = $('#items-list .list-group li.active')[0];
        if (liItem) {
            console.log(liItem)
            let li = e.target.closest('li')
            let fileId = li ? li.id : null;

            let itemId = liItem.id;
            let search = $('#search-files .search-input').val();

            if (fileId || search) {
                $.post(getAction() + 'add-files', { itemId, search, fileId, _csrf }, (resp) => {
                    if (resp.err) {
                        showError('Filtre primero no se puede agregar todos los files juntos', 'text-danger');
                    } else {
                        if (search) {
                            showError('Files Agregados: ' + resp.count, 'text-success');
                        }
                        loadFiles({ search, page: getCurPage('files') });
                    }
                });
            } else {
                console.log("vId & search null")
                showError('Filtre primero no se puede agregar todos los files juntos', 'text-danger');
            }

        } else {
            showError('No Hay Folder Para Agregar File', 'text-danger');
        }
    });

    $('#items-container').on('click', '.fa-trash-alt', (e) => {
        let action = getAction();
        let isItem = e.target.closest('.list').id.includes('items-list');

        let postUrl = action + 'delete-' + (isItem ? 'item' : 'file');
        let li = e.target.closest('li');

        let liItem = $('#items-list .content-list li.active')[0];

        $.post(postUrl, { itemId: liItem.id, fileId: li.id, _csrf }, (resp) => {
            
            if (resp.status === "Ok") {
                
                $(li).fadeOut('fast', (e) => {
                    let vPage = getCurPage('files');

                    if (isItem) {
                        loadItemList({ page: getCurPage('items') }, () => {
                            loadFiles({ page: vPage });
                        });
                    } else {
                        if (vPage.length > 0) {
                            loadFiles({ page: vPage });
                        } else {
                            $(li).fadeOut('fast', () => {
                                li.remove();
                            })
                        }
                        $(li).fadeOut('fast', () => {
                                li.remove();
                             loadFiles({ page: vPage });
                        });
                    }
                });
            }
        });
    });
}

