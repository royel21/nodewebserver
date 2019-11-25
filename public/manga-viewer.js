const mangaViewer = document.getElementById('manga-viewer');
const closeMViewer = document.getElementById('close-manga-modal');
const currentImg = document.getElementById('myimg');
var socket = io();

var currentManga = {
    id: "",
    currentPage: 0,
    total: 0,
    imgs: {}
}

var mId = "";
var mPage = 0;
var mTotalPages = 0;
var mImages = {};

closeMViewer.onclick = (e) => {
    $(mangaViewer).fadeOut(200, () => {
        if (document.fullscreenElement) {
            setfullscreen(mangaViewer);
        }
    });
}

$('.btn-fullscr-m').click((e) => {
    setfullscreen(mangaViewer);
});

socket.on("loaded-zipedimage", (data) => {
    //console.log(data);
    if (data.page === mPage) {
        currentImg.src = 'data:img/jpeg;base64, ' + data.img.toString();
        $(mangaViewer).fadeIn(300, (e) => {
            mangaViewer.focus();
        });
    }
    mImages[data.page] = data.img;

    if (data.total) mtotalPage = data.total;

});

openManga = (item) => {
    let src = item.getElementsByTagName('img')[0].src;
    mangaViewer.querySelector('#myimg').src = src;

    mId = item.id;
    mPage = 0;
    socket.emit('loadzip-image', { id: item.id, page: mPage });
}

var nextImg = () => {
    if (mPage > 0) {
        socket.emit('loadzip-image', { id: mId, page: ++mPage });
    }
}

var prevImg = () => {
    if (mPage < mTotalPages - 1) {
        socket.emit('loadzip-image', { id: mId, page: ++mPage });
    }
}


var nextManga = (e) => {
    let next = $('#' + mId).next()[0];
    if (next) {
        openManga(next)
    }
}

var prevManga = (e) => (e) => {
    let prev = $('#' + mId).prev()[0];
    if (prev) {
        openManga(prev);
    }
};




$('#btn-img-config').click((e) => {
    console.log('clicked');
});


var mangaVewerKeyDown = (e) => {
    if ($(mangaViewer).is(':visible')) {
        e.stopPropagation();
        e.preventDefault();
        console.log(e.keyCode);
        switch (e.keyCode) {

        }
    }
}