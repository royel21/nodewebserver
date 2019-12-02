var express = require('express');
var router = express.Router();
var homeController = require('../controllers/HomeControler');

router.get("/", homeController.index);
router.get("/login", homeController.login);
router.get("/logout", homeController.logout);
router.get("/videos/:page?/:items?/:search?", homeController.index);
router.get("/mangas/:page?/:items?/:search?", homeController.index);
router.get("/folder-content/:folder/:page?/:items?/:search?", homeController.index);
router.get("/folders/:page?/:items?/:search?", homeController.index);

router.post("/login", homeController.loginPost);
router.post("/folders/search", homeController.postSearch);
router.post("/videos/search", homeController.postSearch);
router.post("/mangas/search", homeController.postSearch);
router.post("/folder-content/:folder/search", homeController.postSearch);
module.exports = router;