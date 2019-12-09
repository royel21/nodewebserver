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
const db = require('./models/index');

var query = async() => {
    console.time("s");
    let files = await db.file.findAndCountAll({
        attributes: {
            include: [
                'Id', 'Name', 'DirectoryId', 'Type', 'Duration', [db.sqlze.literal("REPLACE(Name, '[','0')"), 'N'],
                [db.sqlze.literal("(Select LastPos from RecentFiles where FileId == File.Id and RecentId == 'pjwhn')"), "CurrentPos"],
                [db.sqlze.literal("(Select FileId from FavoriteFiles where FileId == File.Id and FavoriteId == '0w1sk')"), "isFav"]
            ]
        },
        include: [{
            model: db.category,
            where: {
                Id: "bzy7w"
            }
        }],
        offset: 0,
        limit: 27,
        where: {
            [db.Op.and]: [{
                Name: {
                    [db.Op.like]: "%" + "" + "%"
                }
            }]
        }
    });
    console.timeEnd("s");
    return files;
}

query().then((result) => {
    console.log(result.count, result.rows.length);
});