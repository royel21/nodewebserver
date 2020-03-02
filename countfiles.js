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

// fv 0w1sk
// rc pjwhn
// loli - cat - bzy7w
// const fs = require('fs-extra');
// const path = require('path')

// const db = require('./models/index');
// const addFav = async() => {
//     let fas = fs.readJSONSync('./MyFav.json');
//     let fav = await db.favorite.findByPk('0w1sk');
//     let files = await db.file.findAll({ where: { Name: fas.files } });
//     console.log(files);
//     await fav.addFiles(files);
// }

// addFav();
// var query = async () => {
//     console.time("s");
//     let files = await db.file.findAndCountAll({
//         attributes: {
//             include: [
//                 [db.sqlze.literal("(Select FileId from FavoriteFiles where FileId == File.Id and FavoriteId == 'b1d0p')"), "isFav"],
//                 [db.sqlze.literal("(Select LastPos from RecentFiles where FileId == File.Id and RecentId == 'rsh0o')"), "CurrentPos"],
//                 [db.sqlze.literal("(Select LastRead from RecentFiles where FileId == File.Id and RecentId == 'rsh0o')"), "LastRead"]
//             ]
//         },
//         include: [{
//             model: db.recent,
//             where: {
//                 Id: "rsh0o"// // const fs = require("fs-extra")
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

// fv 0w1sk
// rc pjwhn
// loli - cat - bzy7w
//const db = require('./models/index');
//db.sqlze.options.logging = true;
//const helper = require('./controllers/home/file-helper2');

var query = async() => {



    // console.time("s");
    // let user = await db.user.findOne({
    //     where: {
    //         Name: 'Royel'
    //     }, include: [
    //         { model: db.userConfig },
    //         { model: db.favorite },
    //         { model: db.recent }
    //     ]
    // });
    // let cat = await db.category.findOne();
    // console.log('\n\n\n');
    // let models = [
    //     { model: db.recent, where: { Id: "7z4l9" } },
    //     { model: db.favorite }
    // ]
    // let files = await helper.getFiles({ begin: 0, itemsPerPage: 500, search: "" }, models, "recent")
    //     // let files = await db.file.findAndCountAll({
    //     //     order: [[db.sqlze.literal("LastRead"), 'DESC']],
    //     //     attributes:{
    //     //         include:[
    //     //             [db.sqlze.literal("REPLACE(File.Name, '[','0')"), 'N'],
    //     //             [db.sqlze.literal("`Recents->RecentFiles`.`LastRead`"), 'LastRead'],
    //     //             [db.sqlze.literal("`Recents->RecentFiles`.`LastPos`"), 'CurrentPos'],
    //     //             [db.sqlze.literal("`Favorites`.`UserId`"), 'isFav']
    //     //         ]
    //     //     },
    //     //     include: [
    //     //         {
    //     //             model:db.category,
    //     //             where: {Name: "Flask"}
    //     //         },
    //     //         { model: db.recent },
    //     //         { model: db.favorite}
    //     //     ]
    //     // });
    // let user = await db.user.findAll({ where: { Name: ["Royel", 'Administrator'] }, include: { model: db.favorite } });
    // let favs = (await user.getFavorites()).map((i) => i.Id);

    //console.log(favs.join(','));

    // console.timeEnd("s");

}

// query().then((result) => {

// });
// const moment = require('moment')
// const winex = require('win-explorer');
// const files = winex.ListFilesRO('E:\\Temp\\Hmangas');
// const db = require('./models/index');
// const fs = require('fs-extra')
// const path = require('path')

// const updateDate = async(tfs) => {


//     for (let f of tfs) {
//         if (!f.isDirectory) {
//             // console.log(new Date(f.LastModified))
//             let found = await db.file.findOne({ where: { Name: f.FileName } });
//             if (found) {
//                 // await found.update({ CreatedAt: f.LastModified });
//                 // console.log(found.CreatedAt, fs.statSync(path.join(found.FullPath, f.FileName)));
//                 // console.log(f.LastModified, moment(f.LastModified).toDate(), f.FileName)
//             }
//         } else {
//             updateDate(f.Files);
//         }
//     }

// }

// updateDate(files);

// console.log(winex.ListFiles("H:\\", [], { hidden: true, file: false, directory: true }));
//             },
//             order: [
//                 [db.sqlze.literal("Recents.RecentFiles.LastRead"), 'DESC']
//             ]
//         }],
//         offset: 0,
//         limit: 27,
//         where: {
//             [db.Op.and]: [{
//                 Name: {
//                     [db.Op.like]: "%" + "" + "%"
//                 }
//             }]
//         }
//     });
//     console.timeEnd("s");
//     return files;
// }

// query().then((result) => {
//     console.log(result.count, result.rows[0]);
// });
// const moment = require('moment')
const winex = require('win-explorer');
// const files = winex.ListFilesRO('E:\\Temp\\Hmangas', [], {One: true});
// const db = require('./models/index');
// const fs = require('fs-extra')
// const path = require('path')

// const updateDate = async(tfs) => {

//     console.log(cat)
// }
// updateDate();

//     for (let f of tfs) {
//         if (!f.isDirectory) {
//             // console.log(new Date(f.LastModified))
//             let found = await db.file.findOne({ where: { Name: f.FileName } });
//             if (found) {
//                 // await found.update({ CreatedAt: f.LastModified });
//                 // console.log(found.CreatedAt, fs.statSync(path.join(found.FullPath, f.FileName)));
//                 // console.log(f.LastModified, moment(f.LastModified).toDate(), f.FileName)
//             }
//         } else {
//             updateDate(f.Files);
//         }
//     }

// }

// updateDate(files);

// console.log(winex.ListFiles("E:\\Temp\\Hmangas\\Doujin\\D.L\\[Digital Lover (Nakajima Yuka)] D.L. action 006 (Ukagaka).zip", {
//     oneFile: true
// }));
const chokidar = require('chokidar')


chokidar.watch('E:\\Temp\\Hmangas').on('all', (event, path) => {
    console.log(event, path);
});