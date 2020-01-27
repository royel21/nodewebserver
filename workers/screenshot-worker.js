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

const getScreenShot = async(video, toPath, duration) => {
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

const getVideoDuration = async(video) => {
    return execFileSync(ffprobe, ['-i', video, '-show_entries', 'format=duration', '-v', 'quiet', '-of', 'csv=p=0'], {
        timeout: 1000 *
            60
    });
}

const myworker = async(id) => {
    let files = await db.file.findAll({ where: { DirectoryId: id, Duration: 0 } });

    for (let f of files) {
        let coverPath = path.join(vCover, f.Id + ".jpg");

        if (fs.existsSync(coverPath) && f.Duration < 1) continue;

        let fullPath = path.join(f.FullPath, f.Name);

        if (f.Type.includes("Manga")) {

            if (/zip/ig.test(f.Name)) {
                let total = await thumbnails.ZipCover(fullPath, coverPath);
                await f.update({ Duration: total });
            } else if (/rar/ig.test(f.filePath)) {
                await thumbnails.RarCover(fullPath, coverPath);
            }

        } else {
            let Duration = 0;
            try {
                let tempVal = await getVideoDuration(fullPath);
                if (isNaN(tempVal)) continue;
                Duration = parseFloat(tempVal);
                if (f.Duration === 0) {
                    await f.update({ Duration });
                }
            } catch (err) {
                console.log("Err:", err)
                continue;
            }

            try {
                await getScreenShot(fullPath, coverPath, Duration);

            } catch (err) {
                console.log(err);
            }
        }
    }
}

process.on("message", (data) => {

    foldersThumbNails(data.folders).then(() => {
        vCover = path.resolve('./public', 'covers', 'files', 'folder-' + data.id);
        if (!fs.existsSync(vCover)) {
            fs.mkdirsSync(vCover);
        }
        folId = data.id;
        myworker(data.id).then(() => {
            console.log("finish");
            process.exit();
        }).catch(err => {
            console.log(err);
            process.exit();
        });
    });
});

var foldersThumbNails = async(folders) => {
    for (let s of folders) {
        try {
            if (!s.isManga) {
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