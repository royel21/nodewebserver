

const WinDrive = require('win-explorer');
const fs = require('fs-extra')

// console.log(files)
// var test1 = {a: true};

// if(test1.a && test1.b)
// {
//     console.log(true)
// }else{
//     console.log(false)
// }
var ffmpeg = require("fluent-ffmpeg");
var ffpstatic = require('ffprobe-static');
var ffmstatic = require('ffmpeg-static');

// var files = WinDrive.ListFiles('C:\\', [], { hidden: false, file: false, directory: true });

ffmpeg.setFfmpegPath(ffmstatic.path) //Argument path is a string with the full path to the ffmpeg binary.
ffmpeg.setFfprobePath(ffpstatic.path) //Argument path is a string with the full path to the ffprobe binary.
// ffmpeg.ffprobe('D:\\Download\\Jav\\ADN-189.mp4', function (err, metadata) {
//     console.log(metadata.format.duration, metadata.format.size);
// });

// ipc.on('reload-Db', function (event, data, fromWindowId) {
//     let fromWindow = BrowserWindow.fromId(fromWindowId);


// scanDirs = async () => {
//     timer = new Date();
//     // if (data.resetDb) {
//     //     await db.init(true);
//     // }
//     for (var f of data.folders) {
//         await scanOneDir(f);
//     }
//     // fromWindow.webContents.send('error', "Scan Done: " + (new Date() - timer));
//     // window.close();
// }
const db = require('./models')
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
                // count: 4,
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
db.init().then(() => {
    scanOneDir("D:\\Anime");
});

// timer = new Date();
// let arr = [];
// let num = parseInt("7FFF", 16);
// for (let i = 0; i < 100000; i++) {
//     let id1 = Math.random().toString(36).slice(-5);
//     arr.push(id1);
// }
// timer = new Date() - timer;
// console.log("End:", timer / 1000);
// console.log("id1:" + arr.length);

// for(;arr.length > 0; ){
//     let item = arr.splice(0,1);
//     console.log(arr.length)
//     if(arr.includes(item))
//     {
//         console.log(item, arr[arr.indexOf(item)])
//     }
// }


// timer = new Date();
// let id2 = (+new Date).toString(36).slice(-5);
// timer = new Date() - timer;
// console.log("End:", timer / 1000);
// // Using new Date
// console.log("id2:" + id2);