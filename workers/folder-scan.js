

const WinDrive = require('win-explorer');
const { fork } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp')

const db = require('../models');

var tempFiles = [];
const coverPath = path.join('./static', 'covers', 'series');

const worker = fork('./workers/screenshot-worker.js');
fs.mkdirsSync(coverPath);

function NormalizeName(name, padding = 3) {
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
    return temp;
}

PopulateDB = async (folder, files, fId, se) => {
    let filteredFile = files.filter((f) => {
        return f.isDirectory || ['mp4', 'mkv', 'avi', 'ogg'].includes(f.extension.toLocaleLowerCase()) &&
            !f.isHidden
    });

    for (let f of filteredFile) {
        try {
            if (!f.isDirectory) {
                let Id = Math.random().toString(36).slice(-5);
                let found = tempFiles.filter(v => v.Name === f.FileName);
                let vfound = await db.video.findOne({
                    where: {
                        $or: [{
                            Id: Id
                        }, {
                            Name: f.FileName
                        }]
                    }
                });

                if (found.length === 0 && !vfound) {
                    tempFiles.push({
                        Id,
                        Name: f.FileName,
                        NameNormalize: NormalizeName(f.FileName),
                        CoverPath: path.join("/covers/", fId, f.FileName + ".jpg").replace(/#/ig, '%23'),
                        FullPath: folder,
                        DirectoryId: fId,
                        SerieId: se ? se.Id : null
                    });
                } else {
                    if (se) se.addVideo(vfound)
                }

            } else {
                let serie;
                if (f.Files.find(a => !a.isDirectory && ['mp4', 'mkv', 'avi', 'ogg', 'webm'].includes(a.extension.toLocaleLowerCase()))) {
                    let Name = path.basename(f.FileName);
                    if (!await db.serie.findOne({ where: { Name } })) {
                        serie = await db.serie.create({
                            Name,
                        });

                        let SerieCover = path.join(coverPath, serie.Id + ".jpg");
                        if (!fs.existsSync(SerieCover)) {
                            let img = f.Files.find(a => a.extension && ['jpg', 'jpeg', 'png', 'gif'].includes(a.extension.toLocaleLowerCase()));
                            if (img) {
                                await sharp(path.join(f.FileName, img.FileName)).resize({ height: 200 }).toFile(SerieCover);
                            } else {
                                let v = f.Files.filter(a => a.extension && ['mp4', 'mkv', 'avi', 'ogg', 'webm']
                                    .includes(a.extension.toLocaleLowerCase()))[0];
                                if (v) {
                                    worker.send({
                                        serie: true, 
                                        vPath: path.join(f.FileName,v.FileName),
                                        sPath: SerieCover
                                    })
                                }
                            }
                        }
                    }
                }
                await PopulateDB(f.FileName, f.Files, fId, serie);
            }
        } catch (error) {
            console.log(error)
        }
    }
    if (tempFiles.length > 0) await db.video.bulkCreate(tempFiles);
    tempFiles = [];
}

scanOneDir = async (data) => {
    var fis = WinDrive.ListFilesRO(data.dir);
    await PopulateDB(data.dir, fis, data.id);
    console.log('start sub-worker')
    worker.send(data.id);
}

process.on("message", (data) => {
    console.log(data);

    worker.on('close', () => {
        process.send(data);
        process.exit();
    });

    scanOneDir(data);
});
