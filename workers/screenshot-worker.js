const { exec, execSync } = require('child_process');
const db = require('../models');
const path = require('path');
const fs = require('fs-extra')
const ffmpeg = path.resolve('./ffpmeg-bin/ffmpeg.exe');
const ffprobe = path.resolve('./ffpmeg-bin/ffprobe.exe');


const getVideoDuration = (video) => {
    let cmd = ffprobe + ` -i "${video}" -show_entries format=duration -v quiet -of csv="p=0"`
    return execSync(cmd);
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
var work = [];

const myworker = async () => {
    let videos = await db.video.findAll({ where: { Name: { [db.Op.like]: "%%" } } });
    for (let v of videos) {
        console.time('s')
        if(fs.existsSync(path.join(vCover, v.Id+".jpg"))) continue;
        
        let fullPath = path.join(v.FullPath, v.Name);
        let duration = 0;
        try {
            duration = getVideoDuration(fullPath);
        } catch (err) {
            console.log(err);
            continue;
        }
        
        await getScreenShot(fullPath, path.join(vCover, v.Id+".jpg"), duration);
        console.timeEnd('s')
    }
}

process.on("message", (fId) => {
    vCover = path.resolve('./static','covers', 'videos', 'folder-'+fId);

    if(!fs.existsSync(vCover)){
        fs.mkdirsSync(vCover);
    }

    myworker().then(()=>{
        console.log("finish");
        process.exit();
    })
});

