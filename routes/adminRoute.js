const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const videosController = require('../controllers/videosController');
const helperController = require('../controllers/helperController');
const categoriesController2 = require('../controllers/categoriesController2');
const configsController = require('../controllers/configsController');
const seriesController = require('../controllers/seriesController');

router.get("/", usersController.index);
router.get("/users", usersController.users);
router.get("/users/modal", usersController.user_modal);
router.get("/users/:page?/:items?/:search?", usersController.users);
router.post("/users/create-edit", usersController.userModalPost);
router.post("/users/search", usersController.postSearch);

router.get("/series", seriesController.series);
router.get("/series/modal", helperController.modal);
router.get("/series/videos-list", seriesController.videosList);
router.get("/series/items-list", seriesController.itemsList);
router.post("/series/add-videos", seriesController.addVideos);
router.post("/series/modal-post", helperController.modalPost);
router.post("/series/delete-video", helperController.removeVideo);
router.post('/series/delete-item', helperController.delete);


router.get("/categories/", categoriesController2.categories);
router.get("/categories/modal", helperController.modal);
router.get("/categories/videos-list", categoriesController2.videosList);
router.get("/categories/items-list", categoriesController2.itemsList);
router.post("/categories/modal-post", helperController.modalPost);
router.post("/categories/delete-video", helperController.removeVideo);
router.post('/categories/delete-item', helperController.delete);

router.get("/movies", videosController.movies);
router.get("/movies/modal", videosController.movie_modal);
router.get("/movies/create-edit", videosController.movieModalPost);
router.get("/movies/:page?/:items?/:search?", videosController.movies);
router.post("/movies/search", videosController.postSearch);
router.post("/movies/delete", videosController.deleteVideo);

router.get("/configs", configsController.configs);
router.post("/configs/folder-content", configsController.folderContent);
router.post("/configs/delete-path", configsController.deletePath);

module.exports = router;