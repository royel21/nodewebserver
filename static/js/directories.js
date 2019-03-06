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

console.log('loaded')

$('body').on('click', '.tree-view .dir', (e) => {
    let dir = e.target.textContent;
    let path = e.target.closest('ul').dataset.path;
    socket.emit('scan-dir', { path, folder: dir });
});

$('body').on('click', '.fa-sync', (e) => {
    $(e.target).addClass('fa-spin');
    let li = e.target.closest('li');
    let dir = $(li).text();
    console.log(li.id, dir);
    socket.emit('re-scan', { id: li.id, dir });
});


$('body').on('click','#paths .delete-path', (e) => {

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

$('body').on('change', '#tab-config input[type="radio"]',(e)=>{
        console.log(e.target);
        $('#paths').toggleClass('d-none');
        $('#tree-container').toggleClass('d-none');
        
        if(e.target.id.includes('disk')){
            socket.emit('load-disks', "load now");  
        }
});