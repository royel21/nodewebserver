const path = require('path')
const ffprobe = path.resolve('./ffpmeg-bin/ffprobe.exe');
const ffmpeg = path.resolve('./ffpmeg-bin/ffmpeg.exe');
const { exec, execFile, execFileSync, spawn } = require('child_process');

// const fs = require('fs-extra')

// const getVideoDuration = (video) => {
//   return execFileSync(ffprobe, ['-i', video, '-show_entries', 'format=duration', '-v', 'quiet', '-of', 'csv=p=0']);
//   //'-of', 'csv="p=0"'
// }

// const getScreenShot2 = async (video, toPath, duration) => {
//   let pos = (duration * 0.237).toFixed(2);
//   //let cmd = ffmpeg + ` -ss ${pos} -i "${video}" -y -vframes 1 -q:v 0 -vf scale=240:-1 "${toPath}"`
//   return await execFile(ffmpeg,
//     ['-ss', pos, '-i', video, '-y', '-vframes', 1, '-q:v', 0, '-vf', 'scale=340:-1', toPath]);
// }

// const getScreenShot = async (video, toPath, duration) => {
//   let pos = (duration * 0.237).toFixed(2);
//   let cmd = ffmpeg + ` -ss ${pos} -i "${video}" -y -vframes 1 -q:v 0 -vf scale=340:-1 "${toPath}"`
//   return await new Promise((resolve, reject) => {
//     exec(cmd, (err, stdout, stderr) => {
//       if (err) {
//         resolve(false);
//         console.log(err);
//         return;
//       }
//       resolve(true);
//     });
//   });
// }

// const screenShot = async () => {

//   let vPath = 'D:\\Programming\\C#\\ASP NET Core';
//   let videos = fs.readdirSync(vPath);

//   for (let [i, v] of videos.entries()) {
//     let video = path.join(vPath, v);
//     let duration = parseFloat(getVideoDuration(video));
//     console.log(duration, v)
//     console.time('s');
//     // await getScreenShot(video, './' + i + '.jpg', duration);
//     getScreenShot2(video, './' + i + '.jpg', duration);
//     console.timeEnd('s');
//   }
// }

// screenShot().catch(err => {
//   console.log(err);
// });
let video = 'D:\\Programming\\C#\\ASP NET Core\\ASP.NET Core Web App Tutorial - Part 1.mp4'
let child = spawn('cmd');

child.stdin.setEncoding('utf-8');
let pos = (2908.74 * 0.237).toFixed(2);
let cmd = ffmpeg + ` -ss ${pos} -i "${video}" -y -vframes 1 -q:v 0 -vf scale=240:-1 `
console.time('s')
let result = child.stdin.write(cmd+' "1.jpg"\n');
let result2 = child.stdin.write(cmd+' "2.jpg"\n');
let result3 = child.stdin.write(cmd+' "3.jpg"\n');
let result4 = child.stdin.write(cmd+' "4.jpg"\n');
let result5 = child.stdin.write(cmd+' "5.jpg"\n');
// child.stdin.write(ffmpeg+' -i "'+video+'"');'-v', 'quiet', '-of', 'csv=p=0'

child.stdin.end();
console.log(result)
console.log(result2)
console.log(result3)
console.log(result4)
console.log(result5)
console.timeEnd('s')