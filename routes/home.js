var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var bodyParser = require('body-parser')
var homController = require('../controllers/HomeControler')

var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

router.get("/", homController.index);
router.get("/login", csrfProtection, homController.login);
router.post("/login", parseForm, csrfProtection, homController.loginPost);

module.exports = router;