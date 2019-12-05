var express = require('express');
var router = express.Router();
var homeController = require('../controllers/HomeControler');
var favController = require('../controllers/favoritesController');
var recentController = require('../controllers/recentsController');

router.get("/", recentController.recent);

router.get("/recents/:page?/:items?/:search?", recentController.recent);
router.post("/recents/search", recentController.postSearch);

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


router.get("/favorites/:page?/:items?/:search?", favController.favorite);
router.post("/favorites/addfav", favController.postFavorite)
router.post("/favorites/search", favController.postSearch);

module.exports = router;