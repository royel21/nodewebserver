const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const bodyParser = require('body-parser');
const usersController = require('../controllers/usersController')
const moviesController = require('../controllers/moviesController')
const categoriesController = require('../controllers/categoriesController')
const configsController = require('../controllers/configs-controller')

// const csrfProtection = csrf({ cookie: true });
//const parseForm = bodyParser.urlencoded({ extended: false });

router.get("/", usersController.index);
router.get("/users", usersController.users);
router.get("/users/:page?/:items?/:search?", usersController.users);
router.get("/user-modal", usersController.user_modal);
router.post("/create-edit-user", usersController.userModalPost);
router.post("/users/search", usersController.postSearch);

router.get("/movies", moviesController.movies);
router.get("/movies/:page", moviesController.movies);
router.get("/movies-modal", moviesController.movie_modal);
router.get("/movies-modal/create-edit-movie", moviesController.movieModalPost);
router.post("/array-test", moviesController.testPost);

router.post("/categories", categoriesController.categoriesPost);
router.get("/categories/:page?/:items?", categoriesController.categories);
router.get("/category-modal", categoriesController.category_modal);
router.post("/create-edit-category", categoriesController.categoryModalPost);

router.get("/configs", configsController.configs);
router.post("/folder-content", configsController.folderContent);
router.post("/add-path", configsController.AddPath);
router.post("/delete-path", configsController.deletePath);
module.exports = router;