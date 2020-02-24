var express = require('express');
var router = express.Router();
var homeController = require('../controllers/home/homeControler');
var favController = require('../controllers/home/favoritesController');
var recentController = require('../controllers/home/recentsController');
var categoriesController = require('../controllers/home/categoriesController');


router.get("/", recentController.recent);

router.get("/recents/:page?/:items?/:search?", recentController.recent);
router.post("/recents/search", recentController.postSearch);
router.post("/recents/remove-file", recentController.postRemoveFile);

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
// router.post("/folder-content/:orderby/:folder/search", homeController.postSearch);

router.get("/favorites/favorites-list", favController.favoriteList);
router.get("/favorites/create-edit-modal", favController.createEditModal);
router.get("/favorites/:orderby/:list?/:page?/:items?/:search?", favController.favorite);

router.post("/favorites/create-edit", favController.create);
router.post("/favorites/remove", favController.remove);
router.post("/favorites/add-file", favController.addFile);
router.post("/favorites/remove-file", favController.removeFile);
// router.post("/favorites/:orderby/:list/search", favController.postSearch);

router.get("/categories/:orderby/:list?/:page?/:items?/:search?", categoriesController.categories);
// router.post("/categories/:orderby/:list/search", categoriesController.postSearch);

module.exports = router;