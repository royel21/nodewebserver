

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
                        FullPath: folder,
                        DirectoryId: fId,
                        SerieId: se ? se.Id : null,
                        Size: f.Size
                    });
                } else {
                    if (!vfound.Size) {
                        await vfound.update({ Size: f.Size });
                    }
                }

            } else {
                let serie;
                if (f.Files.find(a => !a.isDirectory && ['mp4', 'mkv', 'avi', 'ogg', 'webm'].includes(a.extension.toLocaleLowerCase()))) {
                    let Name = path.basename(f.FileName);
                    let tempSerie = await db.serie.findOrCreate({ where: { Name } });

                    serie = tempSerie[0];

                    let SerieCover = path.join(coverPath, serie.Id + ".jpg");
                    
                    if (!fs.existsSync(SerieCover)) {
                        let img = f.Files.find(a => a.extension && ['jpg', 'jpeg', 'png', 'gif'].includes(a.extension.toLocaleLowerCase()));
                        if (img) {
                            await sharp(path.join(f.FileName, img.FileName)).resize({ height: 200 }).toFile(SerieCover);
                        } else {
                            let v = f.Files.filter(a => a.extension && ['mp4', 'mkv', 'avi', 'ogg', 'webm']
                                .includes(a.extension.toLocaleLowerCase()))[0];
                            try {
                                if (v) {
                                    serieCovers.push({
                                        serie: true,
                                        vPath: path.join(f.FileName, v.FileName),
                                        cPath: SerieCover
                                    });
                                }
                            } catch (err) {
                                console.log(err, f.FileName)
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
    try{
        await PopulateDB(data.dir, fis, data.id);
    }catch(err){
        console.log(err);
    }
    console.log('start sub-worker')
    data.series = serieCovers;
    
    worker.send(data);
}

process.on("message", (data) => {

    worker.on('close', () => {
        process.send(data);
        process.exit();
    });

    scanOneDir(data);
});
