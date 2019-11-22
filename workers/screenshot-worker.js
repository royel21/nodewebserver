const { exec, execFile, execFileSync } = require('child_process');
const db = require('../models');
const path = require('path');
const fs = require('fs-extra');
const os = require("os");
const thumbnails = require('../modules/thumbsnail');

var ffmpeg = require("ffmpeg-static").path;
var ffprobe = require("ffprobe-static").path;

if (os.platform().includes("linux")) {
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
                return;
            }
            resolve(true);
        });
    });
}

const getVideoDuration = async (video) => {
    return execFileSync(ffprobe, ['-i', video, '-show_entries', 'format=duration', '-v', 'quiet', '-of', 'csv=p=0'],
        { timeout: 1000 * 60 });
}

const myworker = async (id) => {
    let files = await db.file.findAll({ where: { DirectoryId: id } });

    for (let f of files) {
        let coverPath = path.join(vCover, f.Id + ".jpg");

        if (fs.existsSync(coverPath)) continue;

        let fullPath = path.join(f.FullPath, f.Name);

        if (f.Type.includes("Manga")) {
            
            if (/zip/ig.test(f.Name)) {
                await thumbnails.ZipCover(fullPath, coverPath);
            } else if (/rar/ig.test(s.filePath)) {
                await thumbnails.RarCover(fullPath, coverPath);
            }
            
        } else {
            let duration = 0;
            try {
                let tempVal = await getVideoDuration(fullPath);
                if (isNaN(tempVal)) continue;
                duration = parseFloat(tempVal);
                console.log("duration: ", duration);
                if (f.Duration < 1) {
                    await f.update({ Duration: duration });
                }
            } catch (err) {
                console.log("Err:", err)
                continue;
            }

            try {
                await getScreenShot(fullPath, coverPath, duration);

            } catch (err) {
                console.log(err);
            }
        }
    }
}

process.on("message", (data) => {

    seriesThumbNails(data.series).then(() => {
        vCover = path.resolve('./public', 'covers', 'files', 'folder-' + data.id);
        console.log("creating file covers");
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
            if (!s.isManga) {
                console.log(s.coverPath);
                let duration = await getVideoDuration(s.filePath);
                if (isNaN(duration)) continue;
                await getScreenShot(s.filePath, s.coverPath, duration);
            } else {
                if (/zip/ig.test(s.filePath)) {
                    await thumbnails.ZipCover(s.filePath, s.coverPath)
                } else if (/rar/ig.test(s.filePath)) {
                    await thumbnails.RarCover(s.filePath, s.coverPath);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
}