

const WinDrive = require('win-explorer');
const { fork } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const db = require('../models');

var tempFiles = [];

const worker = fork('./workers/screenshot-worker.js');

PopulateDB = async (folder, files, fId) => {
    var filteredFile = files.filter((f) => {
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
                let cover = path.resolve("./static/covers/", fId, f.FileName + ".jpg");
                let fullpath = path.join(folder, f.FileName)
                if (!fs.existsSync(cover)) {
                    worker.send({ file: fullpath, cover });
                }
                if (found.length === 0 && !vfound) {

                    tempFiles.push({
                        Id,
                        Name: f.FileName,
                        CoverPath: path.join("/covers/", fId, f.FileName + ".jpg").replace(/#/ig, '%23'),
                        FullPath: fullpath,
                        DirectoryId: fId
                    });
                }
            } else {
                await PopulateDB(f.FileName, f.Files, fId);
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
    fs.mkdirsSync('./static/covers/' + data.id);
    await PopulateDB(data.dir, fis, data.id);
}

process.on("message", (data) => {
    console.log(data);

    worker.on('close', () => {
        process.send(data);
        process.exit();
    });
    
    scanOneDir(data).then(() => {
        worker.send("finish");
    });
});
