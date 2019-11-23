const mangaViewer = document.getElementById('manga-viewer');
const closeMViewer = document.getElementById('close-manga-modal');

openManga = (item) => {
    $(mangaViewer).fadeIn(300);
}

$('.btn-fullscr-m').click((e)=>{
    setfullscreen(mangaViewer);
})

closeMViewer.onclick = (e) => {
    $(mangaViewer).fadeOut(200, () => {
       if(document.fullscreenElement){
           setfullscreen(mangaViewer);
       }
    });
}