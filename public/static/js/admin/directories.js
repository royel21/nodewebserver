var loadDirectories = () => {
    $('#container').on('click', '#tree-container .caret', (e) => {
        let treeItem = e.target.closest('li');
        if (treeItem.childNodes.length === 2) {
            let dir = $(treeItem).find('.dir').text();
            let path = e.target.closest('ul').dataset.path;

            $.post('/admin/directories/folder-content', {
                path, folder: dir.trim(),
                _csrf: $("#paths").data('csrf')
            }, (resp) => {

                $(treeItem).append(resp)
            });
        } else {
            $(treeItem).find('ul').remove();
        }
    });

    $('#container').on('click', '#tree-container .dir', (e) => {
        let dir = e.target.textContent.trim();
        let path = e.target.closest('ul').dataset.path;
        socket.emit('scan-dir', { path, folder: dir });
    });

    $('#container').on('click', '#paths .fa-sync', (e) => {
        $(e.target).addClass('fa-spin');
        let li = e.target.closest('li');
        let dir = $(li).text();
        socket.emit('re-scan', { id: li.id, dir });
    });


    $('#container').on('click', '#paths .delete-path', (e) => {
        let li = e.target.closest('li');
        $.post('/admin/directories/delete-path', {
            id: li.id,
            _csrf: $("#paths").data('csrf')
        }, (resp) => {
            if (resp == "ok") {
                $(li).fadeOut((e) => {
                    li.remove();
                });
            }
        });
    });

    if (!socket._callbacks['$disk-loaded']) {
        socket.on("disk-loaded", (data) => {
            $('#disks').empty().append(data);
        });

        socket.on('path-added', (newPath) => {
            if (newPath) {
                $("#paths").append(newPath);
            }
        });

        socket.on("scan-finish", (data) => {
            $('#' + data.id + ' .fa-sync').removeClass('fa-spin');
        });
    }

    $('#tab-directory input[type="radio"]').change((e) => {
        $('#directories').toggleClass('d-none');
        $('#tree-container').toggleClass('d-none');

        if (e.target.id.includes('disk')) {
            socket.emit('load-disks', "load now");
            console.log("loading-disk")
        }
    });
}
