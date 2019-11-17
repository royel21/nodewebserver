const fs = require("fs-extra")
console.log("Videos:",fs.readdirSync("./static/covers/videos/folder-2vdgi").length)
console.log("Series:",fs.readdirSync("./static/covers/series").length)