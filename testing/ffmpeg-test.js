const { exec } = require('child_process');
const path = require('path');

const ffmpeg = path.resolve('../ffpmeg-bin/ffmpeg.exe');
const ffprobe = path.resolve('../ffpmeg-bin/ffprobe.exe');

const getVideoDuration = async (video) => {
    let cmd = ffprobe + ` -i "${video}" -show_entries format=duration -v quiet -of csv="p=0"`
    return await new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(stdout);
        });
    })
}

const getScreenShot = async (video, toPath, vDuration) => {
    let img = path.join(toPath, path.basename(video) + ".jpg");
    let pos = vDuration * 23.9;
    let cmd = ffmpeg + ` -i "${video}" -y -ss ${pos} -vframes 1 -q:v 2 -vf scale=240:-1 "${img}.jpg"`
    return await new Promise((resolve, reject) => {
        console.log("screen");
        // exec(cmd, (err, stdout, stderr) => {
        //     if (err) {
        //         console.log(err)
        //         reject(err);
        //         return;
        //     }
        //     resolve(stdout);
        // });
    })
}

const videoPath = 'D:\\anime\\One Piece\\[by d_a_HD] One Piece (788).mp4';
var start = new Date();
getVideoDuration(videoPath).then(duration => {
    getScreenShot(videoPath, './', duration).then(result => {
        console.log(new Date() - start);
        console.log(result);
    })
});