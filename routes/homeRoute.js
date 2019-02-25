var express = require('express');
var router = express.Router();
var homeController = require('../controllers/homeControler');

router.get("/", homeController.index);
router.get("/login", homeController.login);
router.post("/login", homeController.loginPost);
router.get("/logout", homeController.logout);
module.exports = router;