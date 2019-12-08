// // const fs = require("fs-extra")
// // console.log("Videos:",fs.readdirSync("./static/covers/videos/folder-2vdgi").length)
// // console.log("Series:",fs.readdirSync("./static/covers/series").length)

// function titleCase(str) {
//     var splitStr = str.toLowerCase().split(' ');
//     for (var i = 0; i < splitStr.length; i++) {
//         // You do not need to check if i is larger than splitStr length, as your for does that for you
//         // Assign it back to the array
//         //splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
//         let temp = [];
//         let count = 0;
//         for (let l of splitStr[i].split('')) {
//             if (count == 0 && /[a-zA-Z]/ig.test(l)) {
//                 count++;
//                 temp.push(l.toUpperCase());
//                 continue;
//             }
//             temp.push(l);
//         }
//         splitStr[i] = temp.join('');
//     }
//     // Directly return the joined string
//     return splitStr.join(' ');
// }
// console.time('capitalize');
// let str = titleCase("[Tachibana Nagon] Anaume (COMIC Kairakuten BEAST 2019-12) [Chinese] [得民調得痔瘡得漢化] [Digital]");
// console.timeEnd('capitalize');
// // console.log(str)
// let str = "[Tachibana Nagon] Anaume (COMIC Kairakuten BEAST 2019-12) [Chinese] [得民調得痔瘡得漢化] [Digital]....";
// console.time('capitalize');
// while (true) {
//     if (str[str.length - 1] == '.') {
//         str = str.substr(0, str.length - 2);
//     } else {
//         break;
//     }
// // }
// console.timeEnd('capitalize');
// console.log(str);

// // s3g3u
// // pjwhn
// const db = require('./models/index')

// var query = async() => {
//     console.time("s");
//     let files = await db.file.findAndCountAll({
//         attributes: {
//             include: ['Id', 'Name', 'DirectoryId', 'Type', 'Duration']
//         },
//         joinTableAttributes: ['LastRead', 'LastPos'],
//         include: [{
//             model: db.recent,
//             require: true,
//             where: {
//                 Id: "s3g3u"
//             }
//         }],
//         offset: 0,
//         limit: 3,
//         where: {
//             [db.Op.and]: [{
//                 Name: {
//                     [db.Op.like]: "%" + "Digital" + "%"
//                 }
//             }]
//         }
//     });
//     console.timeEnd("s");
//     return files;
// }

// query().then((result) => {
//     console.log(result.count, result.rows[0].Recents);
// });

const windir = require('win-explorer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs-extra')

// const ipcRenderer = require('electron').ipcRenderer;
// const BrowserWindow = app.BrowserWindow;


// ipcRenderer.on('zip-done', (e, row) => {
//     console.log("zipped done", row)
// });
// zippFile = (data) => {
//     try {
//         var winLoadName = new BrowserWindow({
//             width: 1,
//             height: 1,
//             show: false
//         });
//         var zipper = path.resolve('./background/zip-file.html');
//         winLoadName.loadURL('file://' + zipper);

//         winLoadName.webContents.once('dom-ready', () => {
//             try {
//                 winLoadName.webContents.send('zip-file', data, mainWindow.id);
//             } catch (error) {}
//         });
//         winLoadName.on('closed', (e) => {
//             winLoadName = null;
//         });
//     } catch (error) {
//         console.log(error)
//     }
// }

var dir = "E:\\Temp\\processes";
resizeImages = async(ex) => {

    var files = windir.ListFiles(dir).filter((f) => f.isDirectory && f.FileName != "resize");
    for (var f of files) {
        var filePath = path.join(dir, f.FileName);
        await new Promise((resolve, reject) => {
            var newPath = path.join(path.dirname(filePath), "resize", path.basename(filePath));
            fs.mkdirsSync(newPath);
            var imgs = windir.ListFiles(filePath)
                .filter((f) => ['png', 'gif', 'jpg', 'jpeg'].includes(f.extension.toLocaleLowerCase()));

            var dcount = 0;
            var workerId = setInterval(() => {
                if (imgs.length > 0 && dcount < 3) {

                    new Promise((resolve, reject) => {

                        var d = imgs.shift();
                        //   var newImg = path.join(newPath, d.FileName.split('.')[0]) + '.webp';
                        var newImg = path.join(newPath, d.FileName.split('.')[0]) + ".jpg";
                        sharp(path.join(filePath, d.FileName))
                            // .webp({ quality: 75 })
                            .jpeg({ quality: 75 })
                            .resize(1100).toFile(newImg, (err, info) => {
                                resolve(newImg);
                                console.log(d.FileName);
                                dcount--;
                            });
                    });
                    dcount++;
                }
                if (dcount === 0 && imgs.length === 0) {
                    clearInterval(workerId);
                    //zippFile({ dir: newPath });
                    resolve();
                }
            }, 0);
        });
    }
}

resizeImages(dir);