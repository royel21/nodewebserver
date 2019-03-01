const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController')
const moviesController = require('../controllers/moviesController')
const categoriesController = require('../controllers/categoriesController')
const configsController = require('../controllers/configsController')

// const csrfProtection = csrf({ cookie: true });
//const parseForm = bodyParser.urlencoded({ extended: false });

router.get("/", usersController.index);
router.get("/users", usersController.users);
router.get("/users/modal", usersController.user_modal);
router.get("/users/:page?/:items?/:search?", usersController.users);
router.post("/users/create-edit", usersController.userModalPost);
router.post("/users/search", usersController.postSearch);

router.get("/movies", moviesController.movies);
router.get("/movies/modal", moviesController.movie_modal);
router.get("/movies/create-edit", moviesController.movieModalPost);
router.get("/movies/:page?/:items?/:search?", moviesController.movies);
router.post("/array-test", moviesController.testPost);
router.post("/movies/search", moviesController.postSearch);

router.get("/categories/modal", categoriesController.category_modal);
router.get("/categories/:page?/:items?/:search?", categoriesController.categories);
router.post("/categories/search", categoriesController.postSearch);
router.post("/categories/create-edit", categoriesController.categoryModalPost);

router.get("/configs", configsController.configs);
router.post("/configs/folder-content", configsController.folderContent);
router.post("/configs/delete-path", configsController.deletePath);
module.exports = router;