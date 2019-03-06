var express = require('express');
var router = express.Router();
var homeController = require('../controllers/homeControler');

router.get("/", homeController.index);
router.get("/login", homeController.login);
router.get("/logout", homeController.logout);
router.get("/videos/:serie", homeController.videos);
router.get("/videos/:serie/:page?/:items?/:search?", homeController.videos);
router.get("/series/:page?/:items?/:search?", homeController.index);
router.post("/login", homeController.loginPost);
router.post("/video/search", homeController.postSearch);
module.exports = router;