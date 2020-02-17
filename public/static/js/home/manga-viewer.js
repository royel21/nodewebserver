const ElById = (id) => document.getElementById(id);

const mangaViewer = ElById('manga-viewer');
const mImageView = mangaViewer.querySelector('#myimg');
const closeMViewer = ElById('close-manga-modal');
const currentImg = ElById('myimg');
const mloadingAnimation = ElById('m-loading');
const imgpreview = ElById('img-preview');
const mSlider = ElById('m-range');
const $mName = $('.manga-name');

var disconnected = false;


Array.prototype.IndexOfUndefined = function(from) {
    var i = from;
    while (i++) {
        if (!this[i].src.includes('data:')) {
            return i;
        }
    }
}

var map = (val, min, max) => { return (val - min) / (max - min) }
var mapNum = (val, in_min, in_max, out_min, out_max) => {
    return (val - in_min) * (out_max - out_min) / (in_max - in_min) +
        out_min;
}

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

var loadNewImages = (page, pagetoload = 20) => {
    mLoading = true;
    socket.emit('loadzip-image', { id: currentFile.id, page: page, pagetoload });
}

var fullScreen = (e) => {
    setfullscreen(mangaViewer);
}

var updatePageNumber = () => {
    mSlider.value = currentFile.pos;
    if(pimages[currentFile.pos]) pimages[currentFile.pos].scrollIntoView();
    mSlider.style.setProperty('--val', +currentFile.pos);
    $('#' + currentFile.id + ' .item-progress, #img-viewer .item-progress').text((currentFile.pos + 1) + "/" + mTotalPages);
};


socket.on("m-info", (data) => {
    currentFile.pos = data.page;
    createElements(data.total);
    mTotalPages = data.total;
    mSlider.max = data.total - 1;
    mSlider.style.setProperty('--max', +(data.total - 1));
    updatePageNumber();
});

socket.on('m-finish', (data) => {
    mLoading = false;
});

socket.on("loaded-zipedimage", (data) => {
    //console.log(data);
    if (data.page === currentFile.pos) {
        currentImg.src = 'data:img/jpeg;base64, ' + data.img;
        mloadingAnimation.style.display = "none";
    }

    if (data.img) {
        pimages[data.page].src = 'data:img/jpeg;base64, ' + data.img;
    }
});

socket.on('manga-error', error => {
    console.log(error);
    mLoading = false;
    mloadingAnimation.style.display = "none";
    currentImg.src = "#";
    currentImg.alt = error.error;
});

socket.on('disconnect', error => {
    console.log(error);
    if (error.includes('transport')) {
        location.href = '/login';
    }
});

var mclose = () => {
    $(mangaViewer).fadeOut(200, () => {
        if (document.fullscreenElement) {
            fullScreen();
        }
        selectItem(selectedIndex);
        mangaViewer.style = "";
        mangaViewer.classList.add('d-none')
    });
    stopClock();
    $('#img-preview img').each((i, el) => { el.src = "" });
    if (currentFile.pos > 0) {
        socket.emit('add-or-update-recent', { id: currentFile.id, pos: currentFile.pos });
    }
    currentFile.id = ""; 
    $('#manga-viewer').addClass('d-none');
}

closeMViewer.onclick = mclose;

$('.btn-fullscr-m').click(fullScreen);


var openManga = (item) => {
    $('#manga-name').css({ opacity: 0 });

    if (currentFile.id !== item.id) {
        socket.emit('add-or-update-recent', currentFile);
    } else if ($('#manga-viewer').css('display') !== 'none') {
        return false;
    }

    currentFile.id = item.id;


    $('#img-preview img').each((i, el) => { el.src = "" });

    $mName.text(item.querySelector('.item-name').textContent);
    let src = item.getElementsByTagName('img')[0].src;
    mImageView.src = src;
    mloadingAnimation.style.display = "flex";
    loadNewImages(0, 20);

    if (window.innerWidth < 600) {
        startClock();
    }

    return true;
}
mSlider.oninput = (e) => {
    let val = parseInt(mSlider.value);
    mSlider.style.setProperty('--val', +mSlider.value);
    if(pimages[val]) pimages[val].scrollIntoView();
}

mSlider.onchange = (e) => {

    let val = parseInt(mSlider.value);
    if (pimages[val]) {

        let img = pimages[val].src;

        mImageView.src = img ? img : mImageView.src;
        currentFile.pos = val;
    }
    updatePageNumber();
    mSlider.style.setProperty('--val', +mSlider.value);
}

var nextImg = () => {
    if (currentFile.pos < mTotalPages - 1) {
        $('#manga-name').css({ opacity: 1 });
        
        let timg = pimages[currentFile.pos + 1].src;
        
        if (timg.includes('data:')) {
            mImageView.src = timg;
            currentFile.pos++;
        }

        if (pimages[currentFile.pos + 10] && !pimages[currentFile.pos + 10].src.includes('data:') && !mLoading) {

            loadNewImages(pimages.IndexOfUndefined(currentFile.pos) - 1, 10);
        }
        updatePageNumber();
    } else {
        nextManga();
    }
}

var prevImg = () => {
    if (currentFile.pos > 0) {

        $('#manga-name').css({ opacity: 1 });

        let img = pimages[currentFile.pos - 1].src;
        
        if (img.includes('data:')) {
            mImageView.src = img;
            currentFile.pos--;
        } else if(!mLoading) {
            currentFile.pos--;
            loadNewImages(currentFile.pos - 2, 1);
        }
        updatePageNumber();
    } else {
        prevManga();
    }
}

var nextManga = () => {
    if (mLoading) return;

    let item = ElById(currentFile.id).nextSibling;
    if (item) {
        processFile(item);
    } else if (currentPage < totalPage) {
        mLoading = true;
        loadPartialPage(genUrl(currentPage + 1), () => {
            processFile(document.querySelector('.items:first-child'));
        });
    }
}

var prevManga = () => {
    if (mLoading) return;

    let item = ElById(currentFile.id).previousSibling;
    if (item) {
        processFile(item);
    } else if (currentPage > 1) {
        mLoading = true;
        loadPartialPage(genUrl(currentPage - 1), () => {

            processFile(document.querySelector('.items:last-child'));
        });
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
                socket.emit('loadzip-image', { id: currentFile.id, range: inView });
            }
            clearTimeout(scrTout);
            scrTout = null;
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

$('#manga-name').on('webkitTransitionEnd transitionend', (e) => {
    $('#manga-name').css({ opacity: 0 });
});