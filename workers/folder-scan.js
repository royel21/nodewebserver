

const WinDrive = require('win-explorer');
const { fork } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const { NormalizeName } = require('../Utils/StringUtil')

const db = require('../models');

var tempFiles = [];
const coverPath = path.join('./static', 'covers', 'series');

const worker = fork('./workers/screenshot-worker.js');
fs.mkdirsSync(coverPath);

var serieCovers = [];

createCover = async (dir, files) => {
    let serie;
    let firstFile = files.filter(a => a.extension && ['mp4', 'mkv', 'avi', 'ogg', 'webm', 'rar', 'zip']
        .includes(a.extension.toLocaleLowerCase()))[0];

    if (firstFile) {
        let Name = path.basename(dir);
        let tempSerie = await db.serie.findOrCreate({ where: { Name } });

        serie = tempSerie[0];

        let SerieCover = path.join(coverPath, serie.Id + ".jpg");

        if (!fs.existsSync(SerieCover)) {

            let img = files.find(a => a.extension && ['jpg', 'jpeg', 'png', 'gif'].includes(a.extension.toLocaleLowerCase()));

            if (img) {

                await sharp(path.join(dir, img.FileName)).resize({ height: 200 }).toFile(SerieCover);

            } else {
                serieCovers.push({
                    serie: true,
                    filePath: path.join(dir, firstFile.FileName),
                    coverPath: SerieCover,
                    isManga: /rar|zip/ig.test(firstFile.FileName)
                });
            }
        }
    }
    return serie;
}

PopulateDB = async (folder, files, fId, se) => {

    let filteredFile = files.filter((f) => {
        return f.isDirectory || ['mp4', 'mkv', 'avi', 'ogg', 'rar', 'zip'].includes(f.extension.toLocaleLowerCase()) &&
            !f.isHidden
    });

    for (let f of filteredFile) {
        try {
            if (!f.isDirectory) {
                let Id = Math.random().toString(36).slice(-5);
                let found = tempFiles.filter(v => v.Name === f.FileName);
                let vfound = await db.file.findOne({
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
                        FullPath: folder,
                        Type: /rar|zip/ig.test(f.extension) ? "Manga" : "Video",
                        DirectoryId: fId,
                        SerieId: se ? se.Id : null,
                        Size: f.Size
                    });
                } else {
                    if (vfound) {
                        await vfound.update({ Size: f.Size });
                    }
                }

            } else {
                let serie = await createCover(f.FileName, f.Files);
                await PopulateDB(f.FileName, f.Files, fId, serie);
            }
        } catch (error) {
            console.log(f, error);
        }
    }

    if (tempFiles.length > 0) await db.file.bulkCreate(tempFiles);
    tempFiles = [];
}

scanOneDir = async (data) => {

    var fis = WinDrive.ListFilesRO(data.dir);
   
    let serie = await createCover(data.dir, fis);
    await PopulateDB(data.dir, fis, data.id, serie);
    
    data.series = serieCovers;
    worker.send(data);
}

process.on("message", (data) => {

    worker.on('close', () => {
        process.send(data);
        process.exit();
    });

    scanOneDir(data).catch(err => {
        console.log(err);
        process.exit();
    });
});
