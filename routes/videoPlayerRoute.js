var express = require('express');
var router = express.Router();
const fs = require("fs");
const path = require("path");

router.get('/', function (req, res) {
   res.render("videoplayer/index.pug", {title:"Express Server"});
});
//hello
router.get("/movie.mp4",(req, res)=>{
    var file = "D:\\anime\\One Piece\\[by d_a_HD] One Piece (784).mp4";
    // var file = "D:\\Download\\Jav\\ADN-189.mp4"
    fs.stat(file, function (err, stats) {
      if (err) {
        if (err.code === 'ENOENT') {
          // 404 Error if file not found
          return res.sendStatus(404);
        }
        console.log(err)
        res.end(err);
      }
      console.log("loading movie",req.headers.range);
      var range = req.headers.range;
      
      if (!range) {
        // 416 Wrong range
        return res.sendStatus(416);
      }
      var positions = range.replace(/bytes=/, "").split("-");
      var start = parseInt(positions[0], 10);
      var total = stats.size;
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

      var stream = fs.createReadStream(file, { start: start, end: end })
        .on("open", function () {
          stream.pipe(res);
        }).on("error", function (err) {
          res.end(err);
        });
    });
});

//export this router to use in our index.js
module.exports = router;