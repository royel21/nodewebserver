const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const filesController = require('../controllers/filesController');
const helperController = require('../controllers/helperController');
const categoriesController = require('../controllers/categoriesController');
const directoriesController = require('../controllers/directoriesController');
const foldersController = require('../controllers/foldersController');

router.get("/", usersController.index);
router.get("/users", usersController.users);
router.get("/users/modal", usersController.user_modal);
router.get("/users/:page?/:items?/:search?", usersController.users);
router.post("/users/create-edit", usersController.userModalPost);
router.post("/users/search", usersController.postSearch);

router.get("/folders", foldersController.folders);
router.get("/folders/modal", helperController.modal);
router.get("/folders/file-list", foldersController.filesList);
router.get("/folders/items-list", foldersController.itemsList);
router.post("/folders/add-files", foldersController.addFiles);
router.post("/folders/modal-post", helperController.modalPost);
router.post("/folders/delete-file", foldersController.removeFile);
router.post('/folders/delete-item', helperController.delete);

router.get("/categories/", categoriesController.categories);
router.get("/categories/modal", helperController.modal);
router.get("/categories/file-list", categoriesController.filesList);
router.get("/categories/items-list", categoriesController.itemsList);
router.post("/categories/add-files", categoriesController.addFiles);
router.post("/categories/modal-post", helperController.modalPost);
router.post("/categories/delete-file", categoriesController.removeFile);
router.post('/categories/delete-item', helperController.delete);

router.get("/files", filesController.files);
router.get("/files/modal", filesController.file_modal);
router.get("/files/:page?/:items?/:search?", filesController.files);
router.post("/files/update", filesController.fileModalPost);
router.post("/files/search", filesController.postSearch);
router.post("/files/delete", filesController.deleteFile);

router.get("/directories", directoriesController.configs);
router.post("/directories/folder-content", directoriesController.folderContent);
router.post("/directories/delete-path", directoriesController.deletePath);

module.exports = router;