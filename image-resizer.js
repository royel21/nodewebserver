const windir = require('win-explorer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs-extra')


const NormalizeName = (name, padding = 3) => {
    name = name.replace(/.mp4|.mkv|.avi|webm|ogg/ig, '');
    var res1 = name.split(/\d+/g);
    if (res1.length === 1) return name;
    var res2 = name.match(/\d+/g);
    var temp = "";
    if (res1 !== null && res2 !== null) {
        for (let [i, s] of res2.entries()) {
            temp += res1[i] + String(Number(s)).padStart(padding, 0);
        }
        temp = temp + res1[res1.length - 1];
    }
    return Capitalize(temp).replace(/vol. |  /ig, 'Vol.');
}

const Capitalize = (str) => {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        let temp = [];
        let count = 0;
        for (let l of splitStr[i].split('')) {
            if (count == 0 && /[a-zA-Z]/ig.test(l)) {
                count++;
                temp.push(l.toUpperCase());
                continue;
            }
            temp.push(l);
        }
        splitStr[i] = temp.join('');
    }
    // Directly return the joined string
    let name = splitStr.join(' ');
    while (true) {
        if (name[name.length - 1] == '.') {
            name = name.substr(0, name.length - 2);
        } else {
            break;
        }
    }
    return name;
}


var dir = "D:\\Downloads\\Torrents\\Comic LO series";
resizeImages = async(ex) => {
    var files = windir.ListFiles(ex).filter((f) => f.isDirectory && f.FileName != "resize");

    // console.log(files, ex)
    for (var f of files) {

        var filePath = path.join(ex, f.FileName);

        await new Promise((resolve, reject) => {

            var newPath = path.join(path.dirname(filePath), "resize", NormalizeName(path.basename(filePath)));
            fs.mkdirsSync(newPath);
            var imgs = windir.ListFiles(filePath)
                .filter((f) => ['png', 'gif', 'jpg', 'jpeg'].includes(f.extension.toLocaleLowerCase()));
            var dcount = 0;
            var workerId = setInterval(() => {
                if (imgs.length > 0 && dcount < 3) {

                    new Promise((resolve, reject) => {

                        var d = imgs.shift();
                        //   var newImg = path.join(newPath, d.FileName.split('.')[0]) + '.webp';
                        var newImg = path.join(newPath, d.FileName.split('.')[0]) + ".jpg";
                        sharp(path.join(filePath, d.FileName))
                            // .webp({ quality: 75 })
                            .jpeg({ quality: 75 })
                            .resize(950).toFile(newImg, (err, info) => {
                                resolve(newImg);
                                dcount--;
                            });
                    });
                    dcount++;
                }
                if (dcount === 0 && imgs.length === 0) {
                    clearInterval(workerId);
                    //zippFile({ dir: newPath });
                    resolve();
                }
            }, 0);
        });
    }
}

resizeImages(dir);