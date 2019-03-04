

const WinDrive = require('win-explorer');
const fs = require('fs-extra')
var ffmpeg = require("fluent-ffmpeg");
var ffpstatic = require('ffprobe-static');
var ffmstatic = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmstatic.path) //Argument path is a string with the full path to the ffmpeg binary.
ffmpeg.setFfprobePath(ffpstatic.path) //Argument path is a string with the full path to the ffprobe binary.

const db = require('../models')
const path = require('path')

var timer;
var tempFiles = [];

takeScreenShot = async (vfile) => {

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
                folder: './static/covers',
                size: '240x?'
            })
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}

PopulateDB = async (folder, files, id) => {
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

                if (!fs.existsSync("./static/covers/" + f.FileName + ".png")) {
                    await takeScreenShot(path.join(folder, f.FileName));
                }
                if (found.length === 0 && !vfound) {
                    tempFiles.push({
                        Id,
                        Name: f.FileName,
                        FilePath: path.join(folder, f.FileName)
                    });
                }
            } else {
                await PopulateDB(f.FileName, f.Files);
            }
        } catch (error) {
            console.log(error)
        }
    }
    if (tempFiles.length > 0) await db.video.bulkCreate(tempFiles);
    tempFiles = [];
}

scanOneDir = async (dir) => {
    timer = new Date();
    var fis = WinDrive.ListFilesRO(dir);
    await PopulateDB(dir, fis);
    timer = new Date() - timer;
    console.log("End:", timer / 1000);
    console.log(tempFiles.length);
}
process.on("New Folder", (id, folder)=>{
    scanOneDir(folder).then(()=>{
        process.send("Folder Loaded", id);
    });
});
