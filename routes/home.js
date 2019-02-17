var express = require('express');
var router = express.Router();

router.get("/", (req, res)=>{
  res.render("home/index.pug", { title:"Express Server"});
})

module.exports = router;