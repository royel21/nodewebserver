const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const filesController = require('../controllers/filesController');
const helperController = require('../controllers/helperController');
const categoriesController = require('../controllers/categoriesController');
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
router.get("/series/files-list", seriesController.filesList);
router.get("/series/items-list", seriesController.itemsList);
router.post("/series/add-files", seriesController.addFiles);
router.post("/series/modal-post", helperController.modalPost);
router.post("/series/delete-file", seriesController.removeFile);
router.post('/series/delete-item', helperController.delete);

router.get("/categories/", categoriesController.categories);
router.get("/categories/modal", helperController.modal);
router.get("/categories/files-list", categoriesController.filesList);
router.get("/categories/items-list", categoriesController.itemsList);
router.post("/categories/add-files", categoriesController.addFiles);
router.post("/categories/modal-post", helperController.modalPost);
router.post("/categories/delete-file", categoriesController.removeFile);
router.post('/categories/delete-item', helperController.delete);

router.get("/movies", filesController.movies);
router.get("/movies/modal", filesController.movie_modal);
router.get("/movies/:page?/:items?/:search?", filesController.movies);
router.post("/movies/update", filesController.movieModalPost);
router.post("/movies/search", filesController.postSearch);
router.post("/movies/delete", filesController.deleteFile);

router.get("/configs", configsController.configs);
router.post("/configs/folder-content", configsController.folderContent);
router.post("/configs/delete-path", configsController.deletePath);

module.exports = router;