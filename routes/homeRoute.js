var express = require('express');
var router = express.Router();
var homeController = require('../controllers/HomeControler');

router.get("/", homeController.index);
router.get("/login", homeController.login);
router.get("/logout", homeController.logout);
router.get("/videos/:page?/:items?/:search?", homeController.index);
router.get("/serie-content/:serie/:page?/:items?/:search?", homeController.index);
router.get("/series/:page?/:items?/:search?", homeController.index);
router.post("/login", homeController.loginPost);
router.post("/series/search", homeController.postSearch);
router.post("/videos/search", homeController.postSearch);
router.post("/serie-content/:serie/search", homeController.postSearch);
module.exports = router;