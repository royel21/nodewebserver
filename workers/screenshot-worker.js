const { exec, execFile, execFileSync } = require('child_process');
const db = require('../models');
const path = require('path');
const fs = require('fs-extra');
const os = require("os")

var ffmpeg = require("ffmpeg-static").path;
var ffprobe = require("ffprobe-static").path;

if (os.platform().includes("linux")){
    ffmpeg = "ffmpeg";
    ffprobe = "ffprobe";
}

var vCover;

const getScreenShot = async (video, toPath, duration) => {
    let pos = (duration * 0.237).toFixed(2);
    let cmd = ffmpeg + ` -ss ${pos} -i "${video}" -y -vframes 1 -q:v 0 -vf scale=240:-1 "${toPath}"`
    return await new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                resolve(false);
                console.log(err);
                return;
            }
            resolve(true);
        });
    });
}

const getVideoDuration = async (video) => {
    console.log(ffprobe, video)
    return execFileSync(ffprobe, ['-i', video, '-show_entries', 'format=duration', '-v', 'quiet', '-of', 'csv=p=0'],
        { timeout: 1000 * 60 });    
}

const myworker = async (id) => {
    let videos = await db.video.findAll({ where: { DirectoryId: id } });

    for (let v of videos) {
        if (fs.existsSync(path.join(vCover, v.Id + ".jpg"))) continue;

        let fullPath = path.join(v.FullPath, v.Name);
        let duration = 0;
        try {
            let tempVal = await getVideoDuration(fullPath);
            if(isNaN(tempVal)) continue;
            duration = parseFloat(tempVal);
            if (v.Duration < 1) {
                await v.update({ Duration: duration });
            }
        } catch (err) {
            console.log("Duration:", err)
            continue;
        }

        try {
            await getScreenShot(fullPath, path.join(vCover, v.Id + ".jpg"), duration);

        } catch (err) {
            console.log(err);
        }
    }
}

process.on("message", (data) => {

    seriesThumbNails(data.series).then(() => {
        vCover = path.resolve('./static', 'covers', 'videos', 'folder-' + data.id);
        console.log("creating video covers");
        if (!fs.existsSync(vCover)) {
            fs.mkdirsSync(vCover);
        }
        folId = data.id;
        myworker(data.id).then(() => {
            console.log("finish");
            process.exit();
        }).catch(err => {
            console.log(error);
            process.exit();
        });
    });
});

var seriesThumbNails = async (series) => {
    for (let s of series) {
        try {
            console.log(s.cPath);
            let duration = await getVideoDuration(s.vPath);
            if(isNaN(duration)) continue;
            await getScreenShot(s.vPath, s.cPath, duration);
        } catch (err) {
            console.log(err);
        }
    }
}