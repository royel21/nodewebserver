var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var bodyParser = require('body-parser')
var AdminController = require('../controllers/AdminController')

var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

router.get("/", AdminController.index);
router.get("/user-modal",csrfProtection, AdminController.user_modal);
router.post("/create-user", parseForm, csrfProtection, AdminController.create_user);


module.exports = router;