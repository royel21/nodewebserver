var express = require('express');
var router = express.Router();
var homeController = require('../controllers/homeControler');

router.get("/", homeController.index);
router.get("/login", homeController.login);
router.get("/logout", homeController.logout);
router.get("/home/:page?/:items?/:search?", homeController.index);
router.post("/login", homeController.loginPost);
module.exports = router;