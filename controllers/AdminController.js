
var users = require("../models/users")

exports.index = (req, res) => {
    res.render("admin/index.pug", { title: "Administrator", users });
}

exports.user_modal = (req, res) => {
    var uid = req.query.uid
    var u = users[uid - 1];
    var user = u ? u : {};
    res.render("share/modal", { user:{}, csrfToken: req.csrfToken(), modalTitle: uid ? "Editar usuario" : "Crear Usuario" });
}

exports.create_user = (req, res) => {
    console.log(req.body);
    res.render("admin/user-row", req.body);
}