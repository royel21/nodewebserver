const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController')
const videosController = require('../controllers/videosController')
const categoriesController = require('../controllers/categoriesController')
const configsController = require('../controllers/configsController')
const seriesController = require('../controllers/seriesController')

// const csrfProtection = csrf({ cookie: true });
//const parseForm = bodyParser.urlencoded({ extended: false });

router.get("/", usersController.index);
router.get("/users", usersController.users);
router.get("/users/modal", usersController.user_modal);
router.get("/users/:page?/:items?/:search?", usersController.users);
router.post("/users/create-edit", usersController.userModalPost);
router.post("/users/search", usersController.postSearch);

router.get("/series", seriesController.series);

router.get("/movies", videosController.movies);
router.get("/movies/modal", videosController.movie_modal);
router.get("/movies/create-edit", videosController.movieModalPost);
router.get("/movies/:page?/:items?/:search?", videosController.movies);
router.post("/movies/search", videosController.postSearch);
router.post("/movies/delete", videosController.deleteVideo);

router.get("/categories/modal", categoriesController.category_modal);
router.get("/categories/:page?/:items?/:search?", categoriesController.categories);
router.post("/categories/search", categoriesController.postSearch);
router.post("/categories/create-edit", categoriesController.categoryModalPost);

router.get("/configs", configsController.configs);
router.post("/configs/folder-content", configsController.folderContent);
router.post("/configs/delete-path", configsController.deletePath);
module.exports = router;