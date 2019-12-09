const windir = require('win-explorer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs-extra')


var dir = "E:\\Temp\\processes";
resizeImages = async(ex) => {

    var files = windir.ListFiles(dir).filter((f) => f.isDirectory && f.FileName != "resize");
    for (var f of files) {
        var filePath = path.join(dir, f.FileName);
        await new Promise((resolve, reject) => {
            var newPath = path.join(path.dirname(filePath), "resize", path.basename(filePath));
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
                            .resize(1100).toFile(newImg, (err, info) => {
                                resolve(newImg);
                                console.log(d.FileName);
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