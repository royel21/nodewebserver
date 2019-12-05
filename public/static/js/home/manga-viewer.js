const mangaViewer = document.getElementById('manga-viewer');
const mImageView = mangaViewer.querySelector('#myimg');
const closeMViewer = document.getElementById('close-manga-modal');
const currentImg = document.getElementById('myimg');
const mloadingAnimation = document.getElementById('m-loading');
const imgpreview = document.getElementById('img-preview');
const mSlider = document.getElementById('m-range');

var disconnected = false;
var socket = io();

var mangaIds = {};

Array.prototype.IndexOfUndefined = function(from) {
    var i = from;
    while (i++) {
        if (!this[i].src.includes('data:')) {
            return i;
        }
    }
}

var map = (val, min, max) => { return (val - min) / (max - min) }
var mapNum = (val, in_min, in_max, out_min, out_max) => { return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min; }

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
var pimages = [];

var createElements = (count) => {
    let total = imgpreview.querySelectorAll('img').length;
    if (total < count) {
        let c = document.createDocumentFragment();
        for (let i = total; i < count; i++) {
            var tdiv = document.createElement('div');
            var tpage = document.createElement('div');
            var timgdiv = document.createElement('div');
            var timg = document.createElement('img');

            tpage.textContent = i + 1;
            timgdiv.appendChild(timg);
            timgdiv.classList.add("pimgs");
            tdiv.appendChild(timgdiv);
            tdiv.appendChild(tpage);

            c.appendChild(tdiv);
        }
        imgpreview.appendChild(c);
    } else {
        for (let i = total - 1; i > count - 1; i--) {
            imgpreview.childNodes[i].remove();
        }
    }

    pimages = Array.from(imgpreview.querySelectorAll('img'));
    lazyLoad();
}


var loadNewImages = (fromPage, pagetoload = 20) => {
    mLoading = true;
    socket.emit('loadzip-image', { id: mId, page: fromPage, pagetoload });
}

var fullScreen = (e) => {
    setfullscreen(mangaViewer);
}

var updatePageNumber = () => {
    $('.page-number').text(mPage + 1);
    $('#page-total').text(mTotalPages);
    mangaIds[mId].page = mPage;
    mSlider.value = mPage;
    pimages[mPage].scrollIntoView();
    mSlider.style.setProperty('--val', +mPage);
    $('#img-viewer .page-number').text((mPage + 1) + " - " + mTotalPages);
};


socket.on("m-info", (data) => {
    createElements(data.total);
    mTotalPages = data.total;
    mSlider.max = data.total - 1;
    mangaIds[mId].total = data.total;
    mSlider.style.setProperty('--max', +(data.total - 1));
    updatePageNumber();

});

socket.on('m-finish', (data) => {
    mLoading = false;
});

socket.on("loaded-zipedimage", (data) => {
    //console.log(data);
    if (data.page === mPage) {
        currentImg.src = 'data:img/jpeg;base64, ' + data.img;
        $(mangaViewer).fadeIn(300, (e) => {
            mangaViewer.focus();
        });
        mloadingAnimation.style.display = "none";
    }

    if (data.img) {
        pimages[data.page].src = 'data:img/jpeg;base64, ' + data.img;
    }
});

socket.on('disconnect', error => {
    console.log(error);
    if(error.includes('transport')){
        location.href = '/login';
    }
});

var mclose = () => {
    $(mangaViewer).fadeOut(200, () => {
        if (document.fullscreenElement) {
            fullScreen();
        }
        stopClock();
    });
    $('#img-preview img').each((i, el) => { el.src = "" });
}

closeMViewer.onclick = mclose;

$('.btn-fullscr-m').click(fullScreen);


var openManga = (item) => {
    mId = item.id;
    let m = mangaIds[mId];
    if (m) {
        mPage = m.page;
        mTotalPages = m.total;
    } else {
        mangaIds[mId] = { id: mId, page: 0, total: 0 };
        mPage = 0;
    }

    $('#img-preview img').each((i, el) => { el.src = "" });

    $('#manga-name').text($("#" + mId).text());
    let src = item.getElementsByTagName('img')[0].src;
    mImageView.src = src;
    mloadingAnimation.style.display = "flex";
    loadNewImages(mPage - 5, 20);

    if (window.innerWidth < 600) {
        startClock();
    }
}
mSlider.oninput = (e) => {
    let val = parseInt(mSlider.value);
    mSlider.style.setProperty('--val', +mSlider.value);
    pimages[val].scrollIntoView();
}

mSlider.onchange = (e) => {

    let val = parseInt(mSlider.value);
    if (pimages[val]) {

        let img = pimages[val].src;

        mImageView.src = img ? img : mImageView.src;
        mPage = val;
    }
    updatePageNumber();
    mSlider.style.setProperty('--val', +mSlider.value);
}

var nextImg = () => {
    if (mPage < mTotalPages - 1) {
        let timg = pimages[mPage + 1].src;
        if (timg.includes('data:')) {
            mImageView.src = timg;
            mPage++;
        }

        if (pimages[mPage + 10] && !pimages[mPage + 10].src.includes('data:') && !mLoading) {

            loadNewImages(pimages.IndexOfUndefined(mPage) - 1, 10);
        }
        updatePageNumber();
    } else {
        nextManga();
    }
}

var prevImg = () => {
    if (mPage > 0 && !mLoading) {
        let img = pimages[mPage - 1].src;
        if (img.includes('data:')) {
            mImageView.src = img;
            mPage--;
        } else {
            mPage--;
            loadNewImages(mPage - 2, 1);
        }
        updatePageNumber();
    } else {
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
            case keys.nextPage.keycode:
                {
                    nextImg();
                    break;
                }
            case keys.prevPage.keycode:
                {
                    prevImg();
                    break;
                }
            case keys.nextManga.keycode:
                {
                    nextManga();
                    break;
                }
            case keys.prevManga.keycode:
                {
                    prevManga();
                    break;
                }
            case keys.fullscreen.keycode:
                {
                    fullScreen();
                    break;
                }
        }
    }
}

$('#m-caru, .manga-control').click((e) => {
    if (e.target.id.includes('m-caru') || e.target.classList.contains('manga-control')) {
        $('#m-caru').fadeOut(300);
    }
});

var showCarusel = (e) => {
    $('#m-caru').fadeIn(300);
    $(mSlider).trigger('input');
}

var placeHolder = (e) => {}
var areaEvents = {
        "area1": placeHolder,
        "area2": mclose,
        "area3": placeHolder,
        "area4": nextImg,
        "area5": fullScreen,
        "area6": nextImg,
        "area7": prevManga,
        "area8": prevImg,
        "area9": nextManga,
        "area10": showCarusel
    }
    //Area Control
$('#manga-area-control').on('click', '.area', (e) => {
    areaEvents[e.target.id]();
});
$(() => {
    let mangas = localStorage.getObject('mangas');
    if (mangas) {
        mangaIds = mangas;
    }
});

/********************************Range*****************************/

var el, newPoint, newPlace, offset;

// Select all range inputs, watch for change
$("#m-range").on('input', function(e) {

    // Cache this for efficiency
    el = $(this);

    // Measure width of range input
    let width = el.width();

    let outPadding = parseInt($('#mr-out').css('padding-left'));
    let max = parseInt(el[0].max);
    let val = parseInt(el.val());
    //  // Figure out placement percentage between left and right of input
    newPoint = map(val, el[0].min, max) * width + el[0].offsetLeft;

    if (val > (max / 2)) {
        newPoint -= $('#mr-out').width() / 2;
    }

    $('#mr-out').css({
        left: newPoint
    }).text(parseInt(el.val()) + 1);
});

let scrTout;


var lazyLoad = () => {
    let inView = [];
    var lazyImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            let lazyThumb = entry.target.querySelector('img');
            if (entry.isIntersecting) {
                if (!lazyThumb.src.includes('data:')) inView.push(pimages.indexOf(lazyThumb));
            }
        });

        if (scrTout) clearTimeout(scrTout);

        scrTout = setTimeout(() => {
            if (!mLoading) {
                mLoading = true;
                socket.emit('loadzip-image', { id: mId, range: inView });
            }
            clearTimeout(scrTout);
            scrTout = null;
            console.log(inView)
            inView = [];
        }, 50);

    }, {
        rootMargin: "600px",
        threshold: 0.1
    });

    imgpreview.childNodes.forEach((lazyImg) => {
        lazyImageObserver.observe(lazyImg);
    });
}

$(imgpreview).on('click', '.pimgs', (e) => {
    let index = e.target.parentElement.textContent - 1;
    mSlider.value = index;
    $(mSlider).trigger('change');
    $(mSlider).trigger('input');
});