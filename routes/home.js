var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var bodyParser = require('body-parser')
var homeController = require('../controllers/HomeControler')

var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

router.get("/", homeController.index);
router.get("/login", csrfProtection, homeController.login);
router.post("/login", parseForm, csrfProtection, homeController.loginPost);
router.get("/logout", homeController.logout);
module.exports = router;