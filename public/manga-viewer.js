const mangaViewer = document.getElementById('manga-viewer');
const closeMViewer = document.getElementById('close-manga-modal');
socket = io();

socket.on("loaded-zipedimage", (data) => {
    console.log(data)
});

openManga = (item) => {
    let src = item.getElementsByTagName('img')[0].src;
    mangaViewer.querySelector('#myimg').src = src;
    
    socket.emit('loadzip-image', { id: item.id, page: 0 });
    
    $(mangaViewer).fadeIn(300, (e) => {
    });
}

$('.btn-fullscr-m').click((e) => {
    setfullscreen(mangaViewer);
})

closeMViewer.onclick = (e) => {
    $(mangaViewer).fadeOut(200, () => {
        if (document.fullscreenElement) {
            setfullscreen(mangaViewer);
        }
    });
}

$('#btn-img-config').click((e) => {
    console.log('clicked');
    //socket.emit('scan-dir', { path, folder: dir });
});