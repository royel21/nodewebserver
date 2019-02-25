
let db = require('../models');

exports.index = (req, res) => {
    res.redirect('/admin/users');
}

exports.users = (req, res) => {
    let itemsPerPage = req.params.items || req.query.items || 10;
    let currentPage = req.params.page || 1;
    let begin = ((currentPage - 1) * itemsPerPage);
    let val = req.params.search || "";

    db.user.findAndCountAll({
        order: ['Role'],
        offset: begin,
        limit: itemsPerPage,
        where: {
            Name: {
                [db.Op.like]: "%" + val + "%"
            }
        }
    }).then(users => {
        var totalPages = Math.ceil(users.count / itemsPerPage);
        let view = req.query.partial ? "admin/users/partial-users-table" : "admin/index";
        res.render(view, {
            title: "Usuarios", users,
            pagedatas: {
                currentPage,
                itemsPerPage,
                totalPages,
                search: val,
                action:"/admin/users/",
                csrfToken: req.csrfToken()
            }
        });
        
    }).catch(err => {
        res.status(500).send('Internal Server Error');
    });
}

exports.postSearch = (req, res) =>{
    let itemsPerPage = req.body.items || 10;
    let currentPage = req.body.page || 1;
    let val = req.body.search || "";
    res.redirect(`/admin/users/${currentPage}/${itemsPerPage}/${val}?partial=true`)
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
const sendPostResponse = (res, action, state, user) => {
    return res.render("admin/user-row", { user }, (err, html) => {
        console.log(err)
        res.send({ action, state, name: user.Name, data: html });
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
        Password: req.body.password,
        Role: req.body.role,
        CreatedAt: new Date()
    }).then(newUser => {
        sendPostResponse(res, "Usuario", "create", newUser);
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
                State: req.body.state,
                Password: pass
            }).then(updatedUser => {
                sendPostResponse(res, "Usuario", "update", updatedUser);
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