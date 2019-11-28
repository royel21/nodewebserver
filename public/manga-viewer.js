const mangaViewer = document.getElementById('manga-viewer');
const mImageView = mangaViewer.querySelector('#myimg');
const closeMViewer = document.getElementById('close-manga-modal');
const currentImg = document.getElementById('myimg');
const mloadingAnimation = document.getElementById('m-loading'); 
var disconnected = false;
var socket = io();

var mangaConfig = {
    keys: {
        nextManga: {
            name: "PageDown",
            keycode: 34,
            isctrl: false
        },
        prevManga: {
            name: "PageDown",
            keycode: 33,
            isctrl: false
        },
        nextPage: {
            name: "ArrowRight",
            keycode: 39,
            isctrl: false
        },
        prevPage: {
            name: "ArrowLeft",
            keycode: 37,
            isctrl: false
        },
        fullscreen: {
            name: "Enter",
            keycode: 13,
            isctrl: false
        },
        closeViewer: {
            name: "x",
            keycode: 88,
            isctrl: true
        }
    }
}

var mId = "";
var mPage = 0;

var mTotalPages = 0;
var mImages = [];
var mLoading = false;

var loadNewImages = (fromPage, pagetoload = 20) =>{
    mLoading = true;
    socket.emit('loadzip-image', { id: mId, page: fromPage, pagetoload });
}

socket.on("loaded-zipedimage", (data) => {
    //console.log(data);
    if (data.page === mPage) {
        currentImg.src = 'data:img/jpeg;base64, ' + data.img;
        $(mangaViewer).fadeIn(300, (e) => {
            mangaViewer.focus();
        });
    }

    if(data.img) mImages[data.page] = 'data:img/jpeg;base64, ' + data.img;

    if (data.total) mTotalPages = data.total;

    if (data.last) {
        mLoading = false;
        mloadingAnimation.style.display = "none";
    }
});

socket.on('connect_error', error=>{
    console.log(error);
});

socket.on('Disconnect', error=>{
    console.log(error);
});
socket.on('Reconnect', error=>{
    console.log(error);
});
socket.on('Error', error=>{
    console.log(error);
});

closeMViewer.onclick = (e) => {
    $(mangaViewer).fadeOut(200, () => {
        if (document.fullscreenElement) {
            setfullscreen(mangaViewer);
        }
    });
    mImages = [];
}

$('.btn-fullscr-m').click((e) => {
    setfullscreen(mangaViewer);
});


openManga = (item) => {
    mId = item.id;
    mPage = 0;
    mImages = [];
    let src = item.getElementsByTagName('img')[0].src;
    mImageView.src = src;
    mloadingAnimation.style.display = "flex";
    loadNewImages(0, 20);
}

var nextImg = () => {
    if (mPage < mTotalPages - 1) {
        //socket.emit('loadzip-image', { id: mId, page: ++mPage });
        let timg = mImages[mPage + 1];
        if (timg) {
            mImageView.src = mImages[++mPage];
            if(mPage > 10){
                mImages[mPage-11] = "";
            }
        }

        if (mImages.length < mTotalPages && (mImages.length - mPage) < 10 && !mImages[mPage+5] && !mLoading) {
            loadNewImages(mImages.length-1, 10);
        }
    }else{
        nextManga();
    }
}

var prevImg = () => {
    if (mPage > 0 && !mLoading) {
        if(mImages[mPage-1]){
            mImageView.src = mImages[--mPage];
            mImages.pop();
        }else{
            mPage--;
            loadNewImages(mPage, 1);
        }
    }else{
        prevManga();
    }
}

var nextManga = () => {
    let next = $('#' + mId).next()[0];
    if (next && !mLoading) {
        openManga(next);
        selectItem($('.items').index(next));
    }
}

var prevManga = () => {
    let prev = $('#' + mId).prev()[0];
    if (prev && !mLoading) {
        openManga(prev);
        selectItem($('.items').index(prev));
    }
};

$('#btn-img-config').click((e) => {
    console.log('clicked');
});

var mangaVewerKeyDown = (e) => {
    if ($(mangaViewer).is(':visible')) {
        e.stopPropagation();
        e.preventDefault();
        let keys = mangaConfig.keys;

        switch (e.keyCode) {
            case keys.nextPage.keycode: {
                nextImg();
                break;
            }  
            case keys.prevPage.keycode: {
                prevImg();
                break;
            }  
            case keys.nextManga.keycode: {
                nextManga();
                break;
            }  
            case keys.prevManga.keycode: {
                prevManga();
                break;
            }
            case keys.fullscreen.keycode:{
                setfullscreen(mangaViewer);
                break;
            } 
        }
    }
}
var areaEvents = {
    "area1": "",
    "area2": "",
    "area3": "",
    "area4": nextImg,
    "area5": "",
    "area6": nextImg,
    "area7": nextManga,
    "area8": prevImg,
    "area9": prevManga
} 
//Area Control
$('#manga-area-control').on('click','.area',(e)=>{
        areaEvents[e.target.id]();
});