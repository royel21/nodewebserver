
let db = require('../models');

exports.index = (req, res) => {
    res.redirect('/admin/users');
}

exports.users = (req, res) => {
    console.log("my params: ", req.params.page)
    let userPerPage = 20;
    let page = 1;
    let begin = ((page - 1) * userPerPage);
    let val = "";

    db.user.findAndCountAll({
        order: ['Role'],
        offset: begin,
        limit: userPerPage,
        where: {
            Name: {
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


const createUser = (req, res) => {
    console.log("creating");
    if (req.body.username === "" || req.body.username === undefined) {
        return res.send({ err: "Nombre no puede estar vacio" });
    } else if (req.body.password == "" || req.body.password === undefined) {
        return res.send({ err: "password no puede estar vacio" })
    }

    db.user.create({
        Name: req.body.username,
        Password: db.generateHash(req.body.password),
        Role: req.body.role,
        CreatedAt: new Date()
    }).then(newUser => {

        res.render("admin/user-row", {
            id: newUser.Id,
            username: newUser.Name,
            state: newUser.State,
            role: newUser.Role,
            createdA: newUser.CreatedAt
        }, (err, html) => {
            res.send({ state: "create", name: newUser.Name, data: html });
        });
    }).catch(err => {
        res.send({ state: "error", data: "Nombre de usuario en uso" });
    });
}

const updateUser = (req, res) => {
    console.log("updating", req.body);
    db.user.findOne({
        where: { Id: req.body.id }
    }).then(user_found => {
        if (user_found) {
            console.log("rq.user", req.body);
            if (req.user.Name === user_found.Name) {
                return res.send({ state: "error", data: "No puede actualizar usuario en uso" });
            }

            let pass = req.body.password === '' ? user_found.Password : db.generateHash(req.body.password);

            user_found.update({
                Name: req.body.username,
                Role: req.body.role,
                Password: pass
            }).then(updatedUser => {
                res.render("admin/user-row", {
                    id: user_found.Id,
                    username: updatedUser.Name,
                    state: updatedUser.State,
                    role: updatedUser.Role,
                    createdA: updatedUser.CreatedAt
                }, (err, html) => {
                    res.send({ state: "update", name: updatedUser.Name, data: html });
                });
            });
        } else {
            res.send({ state: "error", data: "Usuario no encontrado" });
        }
    }).catch(err => {
        res.send({ state: "error", data: "Error Interno del servidor" });
    });
}

exports.userModalPost = (req, res) => {
    if (req.body.id === '') {
        createUser(req, res);
    } else {
        updateUser(req, res);
    }
}