var express = require('express');
var router = express.Router();
var homeController = require('../controllers/homeControler');

router.get("/", homeController.index);
router.get("/login", homeController.login);
router.get("/logout", homeController.logout);
router.get("/videos/:page?/:items?/:search?", homeController.videos);
router.get("/serie-content/:serie/:page?/:items?/:search?", homeController.videos);
router.get("/series/:page?/:items?/:search?", homeController.index);
router.post("/login", homeController.loginPost);
router.post("/series/search", homeController.postSerieSearch);
router.post("/videos/search", homeController.postVideoSearch);
router.post("/serie-content/:serie/search", homeController.postVideoSearch);
module.exports = router;