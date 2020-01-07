var express = require('express');
var router = express.Router();
var homeController = require('../controllers/home/homeControler');
var favController = require('../controllers/home/favoritesController');
var recentController = require('../controllers/home/recentsController');
var categoriesController = require('../controllers/home/categoriesController');


router.get("/", recentController.recent);

router.get("/recents/:page?/:items?/:search?", recentController.recent);
router.post("/recents/search", recentController.postSearch);
router.post("/recents/remove", recentController.postRemoveFile);

router.get("/login", homeController.login);
router.get("/logout", homeController.logout);
router.get("/videos/:orderby/:page?/:items?/:search?", homeController.index);
router.get("/mangas/:orderby/:page?/:items?/:search?", homeController.index);
router.get("/folder-content/:orderby/:folder/:page?/:items?/:search?", homeController.index);
router.get("/folders/:orderby/:page?/:items?/:search?", homeController.index);

router.post("/login", homeController.loginPost);
router.post("/folders/:orderby/search", homeController.postSearch);
router.post("/videos/:orderby/search", homeController.postSearch);
router.post("/mangas/:orderby/search", homeController.postSearch);
router.post("/folder-content/:orderby/:folder/search", homeController.postSearch);

router.get("/favorites/:orderby/:page?/:items?/:search?", favController.favorite);
router.post("/favorites/:orderby/addfav", favController.postFavorite);
router.post("/favorites/:orderby/remove", favController.postRemoveFile);
router.post("/favorites/:orderby/search", favController.postSearch);

router.get("/categories/:orderby/:cat?/:page?/:items?/:search?", categoriesController.categories);
router.post("/categories/:orderby/:cat/search", categoriesController.postSearch);

module.exports = router;