
let db = require('../models/models');

exports.index = (req, res) => {
    res.redirect('/admin/users');
}

exports.users = (req, res) => {
    console.log("my params: ", req.param.page)
    let userPerPage = 20;
    let page =  1;
    let begin = ((page - 1) * userPerPage);
    let val =  "";

    db.User.findAndCountAll({
        //order: ['Name'],
        offset: begin,
        limit: userPerPage,
        where: {
            UserName: {
                [db.Op.like]: "%" + val + "%"
            }
        }
    }).then(users => {
        var numberOfPages = Math.ceil(users.count / userPerPage);
        res.render("admin/index.pug", { title: "Administrator", users });
        console.log("user: ");
    }).catch(err => {
        console.log("my error: ")
        console.log(err)
        res.status(500).send('Internal Server Error');
    });
}

exports.user_modal = (req, res) => {
    var uid = req.query.uid
    console.log(uid);
    db.User.findOne({
        where: {
            Id: uid
        }
    }).then(data => {
        let user = data ? data : {};
        res.render("admin/user_form",
            {
                user: user, csrfToken: req.csrfToken(),
                modalTitle: uid ? "Editar usuario" : "Crear Usuario"
            });

    }).catch(err => {
        console.log(err);
        res.status(500).send('Internal Server Error');
    });
}



exports.create_user = (req, res) => {
    console.log(req.body);

    if (req.body.username === "" || req.body.username === undefined) {
        return res.send({ err: "Nombre no puede estar vacio" });
    } else if (req.body.password == "" || req.body.password === undefined) {
        return res.send({ err: "password no puede estar vacio" })
    }
    console.log("no empty");
    db.User.create({
        UserName: req.body.username,
        Password: db.generateHash(req.body.password),
        createdAt: new Date()
    }).then(newUser => {
        console.log("user:" + req.body.username + " save");
        console.log(newUser)
        res.render("admin/user-row", {
            Id: newUser.Id,
            UserName: newUser.UserName,
            createdA: newUser.createdAt
        });
    }).catch(err => {
        console.log(err)
        res.send({ err: "Id de usuario duplicado" + req.body.username })
    });
}