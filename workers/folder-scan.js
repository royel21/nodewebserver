

const WinDrive = require('win-explorer');
const fs = require('fs-extra')
const ffmpeg = require("fluent-ffmpeg");
const ffpstatic = require('ffprobe-static');
const ffmstatic = require('ffmpeg-static');
const path = require('path');

const db = require('../models');

ffmpeg.setFfmpegPath(ffmstatic.path) //Argument path is a string with the full path to the ffmpeg binary.
ffmpeg.setFfprobePath(ffpstatic.path) //Argument path is a string with the full path to the ffprobe binary.

var tempFiles = [];

takeScreenShot = async (vfile, fId) => {

    await new Promise((resolve, rejected) => {
        try {
            ffmpeg(vfile).on('end', (e) => {
                resolve(true);
            }).on('error', function (err) {
                console.log(vfile);
                console.log('An error occurred: ' + err.message);
                resolve(false);
            }).screenshots({
                timestamps: ['23.7%'],
                filename: '%f',
                folder: path.join('./static/covers', fId),
                size: '240x?'
            })
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}

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

                if (found.length === 0 && !vfound) {
                    let cover = path.join("./static/covers/", fId, f.FileName + ".png");
                    if (!fs.existsSync(cover)) {
                        await takeScreenShot(path.join(folder, f.FileName), fId);
                    }
                    tempFiles.push({
                        Id,
                        Name: f.FileName,
                        FilePath: path.join(folder, f.FileName),
                        CoverPath: path.join("/covers/", fId, f.FileName + ".png"),
                        FolderId: fId
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
    await PopulateDB(data.dir, fis, data.id);
}
process.on("message", (data) => {
    scanOneDir(data).then(() => {
        process.send(data);
    });
});
