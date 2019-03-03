const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra')
const ffmpeg = path.resolve('./ffpmeg-bin/ffmpeg.exe');
const ffprobe = path.resolve('./ffpmeg-bin/ffprobe.exe');

const getVideoDuration = (video) => {
    let cmd = ffprobe + ` -i "${video}" -show_entries format=duration -v quiet -of csv="p=0"`
    return execSync(cmd);
}

const getScreenShot = async (video, toPath, duration) => {
    let img = path.resolve(toPath, path.basename(video) + ".jpg");
    let pos = (duration * 0.237).toFixed(2);
    let cmd = ffmpeg + ` -ss ${pos} -i "${video}" -y -vframes 1 -q:v 0 -vf scale=240:-1 "${toPath}"`
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
var work = [];

const myworker = async () => {
    let task = work.shift();
    if(task === "finish") return;
    await getScreenShot(task.file, task.cover, getVideoDuration(task.file)).then(myworker);
}
var flag = true;
process.on("message", (task) => {
    work.push(task);
    if (flag) {
        flag = false;
        myworker().then(()=>{
            process.exit();
        });
    }
});

