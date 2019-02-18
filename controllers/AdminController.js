
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

    db.user.findAndCountAll({
        //order: ['Name'],
        offset: begin,
        limit: userPerPage,
        where: {
            username: {
                [db.Op.like]: "%" + val + "%"
            }
        }
    }).then(users => {
        var numberOfPages = Math.ceil(users.count / userPerPage);
        res.render("admin/index.pug", { title: "Administrator", users });
    }).catch(err => {
        res.status(500).send('Internal Server Error');
    });
}

exports.user_modal = (req, res) => {
    var uid = req.query.uid;
    db.user.findOne({
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
        res.status(500).send('Internal Server Error');
    });
}



exports.create_user = (req, res) => {
    if (req.body.username === "" || req.body.username === undefined) {
        return res.send({ err: "Nombre no puede estar vacio" });
    } else if (req.body.password == "" || req.body.password === undefined) {
        return res.send({ err: "password no puede estar vacio" })
    }
    
    db.user.create({
        username: req.body.username,
        password: db.generateHash(req.body.password),
        createdAt: new Date()
    }).then(newUser => {
        
        res.render("admin/user-row", {
            Id: newUser.Id,
            username: newUser.username,
            createdA: newUser.createdAt
        });
    }).catch(err => {
        res.send({ err: "Id de usuario duplicado" + req.body.username })
    });
}