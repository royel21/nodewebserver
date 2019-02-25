

const WinDrive = require('win-explorer');


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

PopulateDB = async (folder, files, id) => {
    var filteredFile = files.filter((f) => {
        return f.isDirectory || ['mp4','mkv','avi', 'ogg'].includes(f.extension.toLocaleLowerCase()) &&
            !f.isHidden
    });


    var tempFiles = [];
    for (let f of filteredFile) {
        try {
            if (!f.isDirectory) {
                let file = await db.video.findOne({
                    where: {
                        Name: f.FileName
                    }
                });
                if (file == null) {
                    tempFiles.push({
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
}

scanOneDir = async (dir) => {
    var fis = WinDrive.ListFilesRO(dir);
    await PopulateDB(dir, fis);
}

scanOneDir("D:\\Download\\Anime")