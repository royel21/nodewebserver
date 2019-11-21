const StreamZip = require('node-stream-zip');
const rcunrar = require('rcunrar');
const sharp = require('sharp');

const images = ['png', 'gif', 'jpg', 'jpeg', 'webp'];

module.exports.RarCover = (file, coverP) => {
    let rar = new rcunrar(file);
    var list = rar.ListFiles().sort((a, b) => {
        return String(a.Name).localeCompare(String(b.Name));
    });

    var firstImg = list.find(e => {
        return images.includes(e.Extension.toLocaleLowerCase()) && e.Size > 1024 *
            30
    });

    if (firstImg == undefined) return false;

    var data = rar.ExtractFile(firstImg);
    return new Promise((resolve, reject) => {
        sharp(data).resize(240).jpeg({
            quality: 80
        }).toFile(coverP, (error) => {
            resolve(coverP);
        });
    });
}

module.exports.ZipCover = (file, coverP) => {
    var zip = new StreamZip({
        file,
        storeEntries: true
    });
    return new Promise((resolve, reject) => {
        zip.on('ready', () => {

            var entries = Object.values(zip.entries()).sort((a, b) => {
                return String(a.name).localeCompare(String(b.name))
            });

            var firstImg = entries.find(e => {
                return images.includes(e.name.toLocaleLowerCase().split('.').pop()) &&
                    e.size > 1024 * 30
            });

            if (firstImg == undefined) {
                resolve(false);
            } else {
                sharp(zip.entryDataSync(firstImg)).jpeg({
                    quality: 80
                }).resize(240).toFile(coverP, (error) => {
                    resolve(coverP);
                });
            }
        });
    });
}
