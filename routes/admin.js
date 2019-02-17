var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var bodyParser = require('body-parser')
var users = require("../models/users")

var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

router.get("/", (req, res)=>{
  res.render("admin/index.pug", { title: "Administrator", users});
});

router.get("/user-modal",csrfProtection, (req, res)=>{
  var uid = req.query.uid
  var u = users[uid];
  var user = u ? u : {};

  res.render("share/modal", {user, csrfToken: req.csrfToken(), modalTitle: uid ? "Editar usuario" : "Crear Usuario"});
});

router.post("/create-user", parseForm, csrfProtection, (req, res)=>{
  console.log(req.body);
  res.render("admin/user-row", req.body);
});


module.exports = router;