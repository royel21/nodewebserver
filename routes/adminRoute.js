var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var bodyParser = require('body-parser')
var usersController = require('../controllers/usersController')
var moviesController = require('../controllers/moviesController')
var categoriesController = require('../controllers/categoriesController')

var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

router.get("/", usersController.index);
router.get("/users", usersController.users);
router.get("/users/:page", usersController.users);
router.get("/user-modal", csrfProtection, usersController.user_modal);
router.post("/create-edit-user", parseForm, csrfProtection, usersController.userModalPost);

router.get("/movies", moviesController.movies);
router.get("/movies/:page", moviesController.movies);
router.get("/movies-modal", csrfProtection, moviesController.movie_modal);
router.get("/movies-modal/create-edit-movie", parseForm, csrfProtection, moviesController.movieModalPost);
router.post("/array-test",moviesController.testPost);

router.post("/categories", categoriesController.categoriesPost);
router.get("/categories/:page?/:items?", categoriesController.categories);
router.get("/categories/:page", categoriesController.categories);
router.get("/category-modal", csrfProtection, categoriesController.category_modal);
router.post("/create-edit-category", parseForm, csrfProtection, categoriesController.categoryModalPost);


module.exports = router;