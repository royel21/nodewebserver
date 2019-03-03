


const ffmpeg = require("fluent-ffmpeg");
const ffpstatic = require('ffprobe-static');
const ffmstatic = require('ffmpeg-static');
const path = require('path');

ffmpeg.setFfmpegPath(ffmstatic.path) //Argument path is a string with the full path to the ffmpeg binary.
ffmpeg.setFfprobePath(ffpstatic.path);

module.exports.screenShots = (video, pathToSave) => {
    var start = new Date();
    return new Promise((resolve, reject) => {
        const cmd = ffmpeg(video).seek(0.1);
        const outputOptions = ['-vframes', 1, '-q:v', 2,'-vf','scale=240:-1']

        cmd.outputOptions(outputOptions)
            .output(path.join(pathToSave, path.basename(video) + "-1.jpg"))
            .on('start', (cmd) => {
                console.log("start: "+cmd);
            })
            .on('end', () => {
                console.log(new Date()-start);
                resolve()
            })
            .on('error', (err) => reject(err))
            .run()
    });
}

module.exports.screenShots2 = (vfile, pathToSave) =>{
    var start = new Date();
    return new Promise((resolve, rejected) => {
        try {
            ffmpeg(vfile).on('end', (e) => {
                console.log(new Date()-start);
                resolve(true);
            }).on('error', function (err) {
                console.log(vfile);
                console.log('An error occurred: ' + err.message);
                resolve(false);
            }).screenshots({
                timestamps: ['23.7%'],
                filename: '%f-2',
                folder: pathToSave,
                size: '240x?'
            })
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}
