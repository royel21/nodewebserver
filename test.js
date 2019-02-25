

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
const crc16 = require('crc').crc16;
var timer;
var tempFiles = [];

PopulateDB = async (folder, files, id) => {
    var filteredFile = files.filter((f) => {
        return f.isDirectory || ['mp4','mkv','avi', 'ogg'].includes(f.extension.toLocaleLowerCase()) &&
            !f.isHidden
    });
    
    for (let f of filteredFile) {
        try {
            if (!f.isDirectory) {
                let found = tempFiles.filter(v => v.Name === f.FileName);
                if(found.length === 0){
                    tempFiles.push({
                        Name: f.FileName,
                        FilePath: path.join(folder, f.FileName)
                    });
                }else{
                    console.log(found);
                }
            } else {
                await PopulateDB(f.FileName, f.Files);
            }
        } catch (error) {
            console.log(error)
        }
    }
    //
}

scanOneDir = async (dir) => {
    timer = new Date();
    var fis = WinDrive.ListFilesRO(dir);
    await PopulateDB(dir, fis);
    if (tempFiles.length > 0) await db.video.bulkCreate(tempFiles);
    timer = new Date()-timer;
    console.log("End:",timer/1000);
    console.log(tempFiles.length);
}

scanOneDir("D:\\Anime")