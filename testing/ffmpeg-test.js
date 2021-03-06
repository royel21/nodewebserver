const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra')
const ffmpeg = path.resolve('../ffpmeg-bin/ffmpeg.exe');
const ffprobe = path.resolve('../ffpmeg-bin/ffprobe.exe');

const getVideoDuration = (video) => {
    let cmd = ffprobe + ` -i "${video}" -show_entries format=duration -v quiet -of csv="p=0"`
    return execSync(cmd);
}

const getScreenShot = async (video, toPath, duration) => {
    let img = path.resolve(toPath, path.basename(video) + ".jpg");
    let pos = (duration * 0.237).toFixed(2);
    let cmd = ffmpeg + ` -ss ${pos} -i "${video}" -y -vframes 1 -q:v 0 -vf scale=240:-1 "${img}"`
    return await new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                resolve(false);
                return;
            }
            resolve(true);
        });
    });
}
const videoPath = 'D:\\anime\\One Piece\\';

fs.readdir(videoPath, (err, files) => {
    files.forEach((f, i) => {
        let video = path.join(videoPath, f);
        const duration = getVideoDuration(video);
        getScreenShot(video, './shots', duration);
    });
});