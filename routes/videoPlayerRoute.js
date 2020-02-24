var express = require('express');
var router = express.Router();
const fs = require("fs");
const path = require("path");
const db = require('../models')

router.get("/video/:fileid", (req, res) => {
    db.file.findOne({ attributes: ['FullPath', 'Name', 'Size'], where: { Id: req.params.fileid } })
        .then(file => {
            if (file) {

                var total = file.Size;
                var range = req.headers.range;
                if (!range) {
                    // 416 Wrong range
                    return res.sendStatus(416);
                }
                var positions = range.replace(/bytes=/, "").split("-");
                var start = parseInt(positions[0], 10);
                if (start === 0) {
                    if (!fs.existsSync(path.join(file.FullPath, file.Name))) return res.sendStatus(404);
                }

                // same code as accepted answer
                var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
                var chunksize = (end - start) + 1;
                // poor hack to send smaller chunks to the browser
                var maxChunk = 1024 * 1024; // 1MB at a time
                if (chunksize > maxChunk) {
                    end = start + maxChunk - 1;
                    chunksize = (end - start) + 1;
                }
                res.writeHead(206, {
                    "Content-Range": "bytes " + start + "-" + end + "/" + total,
                    "Accept-Ranges": "bytes",
                    "Content-Length": chunksize,
                    "Content-Type": "video/mp4"
                });

                var stream = fs.createReadStream(path.join(file.FullPath, file.Name), { start: start, end: end })
                    .on("open", function() {
                        stream.pipe(res);
                    }).on("error", function(err) {
                        res.end(err);
                    });
            } else {
                res.send('error');
            }
        });
});

//export this router to use in our index.js
module.exports = router;